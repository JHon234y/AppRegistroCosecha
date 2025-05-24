
"use client";

import { useState, useEffect, useRef } from 'react';
import type { Harvest, PaymentWorkerInfo } from '@/types';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Banknote, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  harvest: Harvest | null;
  lotId: number | null;
  onSavePayment: (paymentData: any) => void;
}

export function PaymentModal({ harvest, lotId, onSavePayment }: PaymentModalProps) {
  const [open, setOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<'day' | 'kilo' | ''>('');
  const [paymentRate, setPaymentRate] = useState<number | string>('');
  const [workersPaymentData, setWorkersPaymentData] = useState<PaymentWorkerInfo[]>([]);
  const paymentTableRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (harvest && open) { // Recalculate when modal opens
      const calculatedData = harvest.workers.map(worker => {
        let rawTotalHarvested = 0;
        let workedDays = 0;
        Object.values(worker.entries || {}).forEach(weekEntries => {
          Object.values(weekEntries).forEach(dayPesajes => {
            const daySum = dayPesajes.reduce((s, v) => s + v, 0);
            if (daySum > 0) workedDays++;
            rawTotalHarvested += daySum;
          });
        });
        const totalHarvestedRounded = Math.floor(rawTotalHarvested);
        return {
          name: worker.name,
          totalHarvested: totalHarvestedRounded, // Use rounded value
          workedDays,
          payment: 0,
        };
      });

      // Load last payment settings if available and apply to *newly calculated* data
      if (harvest.payments && harvest.payments.length > 0) {
        const lastPayment = harvest.payments[harvest.payments.length - 1];
        setPaymentType(lastPayment.paymentType || '');
        setPaymentRate(lastPayment.paymentRate || '');

        const dataWithPreviousPayments = calculatedData.map(currentWorkerData => {
            const savedWorker = lastPayment.workers.find(lw => lw.name === currentWorkerData.name);
            return savedWorker ? { ...currentWorkerData, payment: savedWorker.payment } : currentWorkerData;
        });
        setWorkersPaymentData(dataWithPreviousPayments);

      } else {
        setWorkersPaymentData(calculatedData);
        setPaymentType('');
        setPaymentRate('');
      }
    } else if (!open) {
      setWorkersPaymentData([]);
      setPaymentType('');
      setPaymentRate('');
    }
  }, [harvest, open]);

  const handleCalculatePayments = () => {
    if (!paymentType || !paymentRate || +paymentRate <= 0) {
      toast({ title: "Error", description: "Seleccione tipo de pago e ingrese una tarifa válida.", variant: "destructive" });
      return;
    }
    const rate = +paymentRate;
    const updatedData = workersPaymentData.map(worker => {
      let payment = 0;
      if (paymentType === 'day') {
        payment = worker.workedDays * rate;
      } else if (paymentType === 'kilo') {
        payment = worker.totalHarvested * rate;
      }
      return { ...worker, payment };
    });
    setWorkersPaymentData(updatedData);
  };

  const handleSaveAndClose = () => {
    if (!harvest || !lotId) return;
    const paymentDataToSave = {
      lotId,
      harvestId: harvest.id,
      date: new Date().toISOString(),
      paymentType,
      paymentRate: +paymentRate,
      workers: workersPaymentData,
      totals: {
        harvested: Math.floor(workersPaymentData.reduce((sum, w) => sum + w.totalHarvested, 0)),
        days: workersPaymentData.reduce((sum, w) => sum + w.workedDays, 0),
        payment: workersPaymentData.reduce((sum, w) => sum + w.payment, 0),
      }
    };
    onSavePayment(paymentDataToSave);
    setOpen(false);
    toast({ title: "Pago Guardado", description: "Los datos de pago han sido guardados." });
  };

  const handleDownloadImage = () => {
    if (paymentTableRef.current) {
      const originalTitle = document.title;
      document.title = `Pago_Trabajadores_${harvest?.date || 'current'}`;

      let computedBgColor = '#0a0e0a'; // Fallback default dark green
      if (typeof window !== 'undefined') {
        // document.body has bg-background applied via Tailwind from globals.css
        // This will get the actual resolved color (e.g., "rgb(10, 14, 10)")
        computedBgColor = window.getComputedStyle(document.body).backgroundColor;
      }

      html2canvas(paymentTableRef.current, {
        scale: 2,
        backgroundColor: computedBgColor, // Use the resolved color
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Pago_Trabajadores_${harvest?.date || 'current'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        document.title = originalTitle;
        toast({ title: "Descarga Iniciada", description: "La imagen de la tabla de pagos se está descargando." });
      }).catch(err => {
        console.error("Error generating image: ", err);
        toast({ title: "Error de Descarga", description: "No se pudo generar la imagen.", variant: "destructive" });
        document.title = originalTitle;
      });
    }
  };

  const totalOverallHarvested = Math.floor(workersPaymentData.reduce((sum, w) => sum + w.totalHarvested, 0));
  const totalOverallWorkedDays = workersPaymentData.reduce((sum, w) => sum + w.workedDays, 0);
  const totalOverallPayment = workersPaymentData.reduce((sum, w) => sum + w.payment, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Banknote className="mr-2 h-4 w-4" /> Pago a Trabajador
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Resumen de Pago a Trabajadores</DialogTitle>
          <DialogDescription>
            Calcule y revise los pagos para la cosecha del {harvest?.date}.
          </DialogDescription>
        </DialogHeader>

        <div ref={paymentTableRef} className="p-4 bg-card text-card-foreground rounded"> {/* Changed to bg-card for consistency with theme */}
          <h3 className="text-center text-lg font-semibold mb-2">Pago Trabajadores - Cosecha {harvest?.date}</h3>
          <Table className="payment-table">
            <TableHeader>
              <TableRow>
                <TableHead>Trabajador</TableHead>
                <TableHead className="text-right">Total Cosechado (kg)</TableHead>
                <TableHead className="text-right">Días Trabajados</TableHead>
                <TableHead className="text-right">Total Pago (COP)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workersPaymentData.map(worker => (
                <TableRow key={worker.name}>
                  <TableCell>{worker.name}</TableCell>
                  <TableCell className="text-right">{Math.floor(worker.totalHarvested)}</TableCell>
                  <TableCell className="text-right">{worker.workedDays}</TableCell>
                  <TableCell className="text-right">{worker.payment.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="totals-row">
                <TableCell><strong>TOTALES</strong></TableCell>
                <TableCell className="text-right"><strong>{totalOverallHarvested}</strong></TableCell>
                <TableCell className="text-right"><strong>{totalOverallWorkedDays}</strong></TableCell>
                <TableCell className="text-right"><strong>{totalOverallPayment.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</strong></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        <div className="payment-controls mt-6 space-y-4">
          <div className="payment-type grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
                <Label htmlFor="payment-type-select">Tipo de Pago</Label>
                <Select value={paymentType} onValueChange={(value: 'day' | 'kilo' | '') => setPaymentType(value)}>
                    <SelectTrigger id="payment-type-select">
                        <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="day">Pago por día</SelectItem>
                        <SelectItem value="kilo">Pago por kilo</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="payment-rate-input">Valor Tarifa (COP)</Label>
                <Input
                    id="payment-rate-input"
                    type="number"
                    step="0.01"
                    placeholder="Valor"
                    value={paymentRate}
                    onChange={e => setPaymentRate(e.target.value)}
                />
            </div>
            <Button onClick={handleCalculatePayments} className="w-full md:w-auto">Calcular Pagos</Button>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={handleDownloadImage}>
            <Download className="mr-2 h-4 w-4" /> Descargar Imagen
          </Button>
          <Button onClick={handleSaveAndClose}>Guardar y Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    
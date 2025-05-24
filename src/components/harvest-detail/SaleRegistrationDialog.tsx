
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Harvest, HarvestSaleInfo } from '@/types';
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
import { DollarSign } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { computeHarvestTotalKg } from '@/lib/utils';
import { format } from 'date-fns';

interface SaleRegistrationDialogProps {
  harvest: Harvest;
  lotId: number;
  onSaveSaleInfo: (details: { harvestId: number; lotId: number; saleData: HarvestSaleInfo }) => void;
}

export function SaleRegistrationDialog({ harvest, lotId, onSaveSaleInfo }: SaleRegistrationDialogProps) {
  const [open, setOpen] = useState(false);
  const [pricePerKilo, setPricePerKilo] = useState<string>('');
  const [saleDate, setSaleDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const { toast } = useToast();

  const totalHarvestedKgRaw = useMemo(() => computeHarvestTotalKg(harvest), [harvest]);
  const totalHarvestedKgRounded = useMemo(() => Math.floor(totalHarvestedKgRaw), [totalHarvestedKgRaw]);


  useEffect(() => {
    if (harvest.saleInfo) {
      setPricePerKilo(harvest.saleInfo.pricePerKilo.toString());
      setSaleDate(harvest.saleInfo.saleDate);
    } else {
        setPricePerKilo('');
        setSaleDate(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [harvest.saleInfo, open]);

  const totalSaleAmount = useMemo(() => {
    const price = parseFloat(pricePerKilo);
    if (!isNaN(price) && price > 0) {
      // Use the rounded total for sale calculation
      return totalHarvestedKgRounded * price;
    }
    return 0;
  }, [totalHarvestedKgRounded, pricePerKilo]);

  const handleSubmit = () => {
    const price = parseFloat(pricePerKilo);
    if (isNaN(price) || price <= 0) {
      toast({ title: "Error", description: "Ingrese un precio por kilo válido.", variant: "destructive" });
      return;
    }
    if (!saleDate) {
      toast({ title: "Error", description: "Seleccione una fecha de venta.", variant: "destructive" });
      return;
    }

    const saleData: HarvestSaleInfo = {
      saleDate,
      pricePerKilo: price,
      totalSaleAmount, // This is calculated using the rounded totalHarvestedKgRounded
      totalHarvestedKgAtSale: totalHarvestedKgRounded, // Store the rounded total kg at the time of sale
    };
    
    onSaveSaleInfo({ harvestId: harvest.id, lotId, saleData });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <DollarSign className="mr-2 h-4 w-4" /> Registrar Venta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Venta de Cosecha</DialogTitle>
          <DialogDescription>
            Ingrese los detalles de la venta para la cosecha del {harvest.date}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="col-span-1">Total Cosechado</Label>
            <p className="col-span-2 font-semibold">{totalHarvestedKgRounded} kg</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="price-per-kilo" className="col-span-1">Precio por Kilo (COP)</Label>
            <Input
              id="price-per-kilo"
              type="number"
              min="0"
              step="0.01"
              value={pricePerKilo}
              onChange={(e) => setPricePerKilo(e.target.value)}
              className="col-span-2"
              placeholder="Ej: 5000"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="sale-date" className="col-span-1">Fecha de Venta</Label>
            <Input
              id="sale-date"
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="col-span-2"
            />
          </div>
          <div className="grid grid-cols-3 items-center gap-4 mt-2">
            <Label className="col-span-1 font-semibold">Ingreso Total</Label>
            <p className="col-span-2 font-bold text-lg text-primary-foreground">
              {totalSaleAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button type="submit" onClick={handleSubmit}>Guardar Venta</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

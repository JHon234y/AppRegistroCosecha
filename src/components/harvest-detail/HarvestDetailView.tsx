
"use client";

import type { Harvest, Lot, Worker as WorkerType, DailyPesajes, HarvestSaleInfo } from '@/types';
import { Button } from '@/components/ui/button';
import { AnimalInfoCard } from '@/components/shared/AnimalInfoCard';
import { AddWorkersDialog } from './AddWorkersDialog';
import { WorkerTable } from './WorkerTable';
import { PaymentModal } from './PaymentModal';
import { SaleRegistrationDialog } from './SaleRegistrationDialog';
import { ArrowLeft, CalendarDays, CalendarPlus, UserMinus2, UserPlus2, Trees, DollarSign, Info, StickyNote } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import React, { useState, useEffect } from 'react';
import { computeHarvestTotalKg, getDailyTotalsForWeek, getGrandTotalForWeek } from '@/lib/utils';


interface HarvestDetailViewProps {
  lot: Lot | undefined;
  harvest: Harvest | undefined;
  onUpdateHarvest: (updatedHarvest: Harvest) => void;
  onBackToHarvests: () => void;
  onSavePayment: (paymentData: any) => void;
  onSaveSaleInfo: (saleDetails: { harvestId: number; lotId: number; saleData: HarvestSaleInfo }) => void;
}

export function HarvestDetailView({ lot, harvest, onUpdateHarvest, onBackToHarvests, onSavePayment, onSaveSaleInfo }: HarvestDetailViewProps) {
  const { toast } = useToast();
  const [showAddSingleWorkerDialog, setShowAddSingleWorkerDialog] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [targetWeekForSingleWorker, setTargetWeekForSingleWorker] = useState<number | null>(null);
  const [currentNotes, setCurrentNotes] = useState(harvest?.notes || '');

  useEffect(() => {
    if (harvest) {
      setCurrentNotes(harvest.notes || '');
    }
  }, [harvest]);
  
  if (!harvest || !lot) {
    return <p>Cargando detalles de la cosecha...</p>;
  }

  const handleAddWorkers = (count: number) => {
    if (harvest.workers.length > 0 && harvest.weeks.length > 0) {
      toast({ title: "Aviso", description: "Ya existen trabajadores. Use 'Añadir Semana' o 'Añadir Trabajador a Tabla'.", variant: "default" });
      return;
    }
    const newWorkers: WorkerType[] = Array(count).fill(null).map((_, i) => ({
      id: Date.now() + i, // Simple unique ID generation
      name: `Trabajador ${harvest.workers.length + i + 1}`,
      entries: {},
      weekTotals: {},
    }));

    const updatedHarvest: Harvest = {
      ...harvest,
      workers: [...harvest.workers, ...newWorkers],
      weeks: harvest.weeks.length === 0 ? [1] : harvest.weeks, 
      dailyTotals: harvest.weeks.length === 0 ? { "1": {} } : harvest.dailyTotals,
      weeklyTotals: harvest.weeks.length === 0 ? { "1": { total: 0} } : harvest.weeklyTotals,
    };
    onUpdateHarvest(updatedHarvest);
    toast({ title: "Trabajadores Añadidos", description: `${count} trabajador(es) añadido(s) a la Semana 1.` });
  };

  const handleAddWeek = () => {
    if (harvest.workers.length === 0) {
      toast({ title: "Error", description: "Añada trabajadores primero antes de añadir una semana.", variant: "destructive" });
      return;
    }
    const nextWeekNum = harvest.weeks.length > 0 ? Math.max(...harvest.weeks) + 1 : 1;
    const updatedHarvest: Harvest = {
      ...harvest,
      weeks: [...harvest.weeks, nextWeekNum].sort((a,b) => a-b),
      dailyTotals: { ...harvest.dailyTotals, [nextWeekNum.toString()]: {} },
      weeklyTotals: { ...harvest.weeklyTotals, [nextWeekNum.toString()]: { total: 0 } },
      workers: harvest.workers.map(w => ({
        ...w,
        entries: {
          ...w.entries,
          [nextWeekNum.toString()]: initializeWeekEntriesForWorker()
        },
        weekTotals: { ...w.weekTotals, [nextWeekNum.toString()]: 0 }
      }))
    };
    onUpdateHarvest(updatedHarvest);
    toast({ title: "Semana Añadida", description: `Semana ${nextWeekNum} añadida.` });
  };

  const initializeWeekEntriesForWorker = (): DailyPesajes => {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const entries: DailyPesajes = {};
    days.forEach(day => {
      entries[day] = []; 
    });
    return entries;
  };

  const handleWorkerDataChange = (weekNum: number, workerIndex: number, day: string, newPesajesForDay: number[]) => {
    const mutableHarvest = JSON.parse(JSON.stringify(harvest)) as Harvest; 
    
    if (!mutableHarvest.workers[workerIndex]) return;

    let worker = mutableHarvest.workers[workerIndex];
    if (!worker.entries) worker.entries = {};
    if (!worker.entries[weekNum.toString()]) worker.entries[weekNum.toString()] = initializeWeekEntriesForWorker();
    
    worker.entries[weekNum.toString()][day] = newPesajesForDay;
    
    let workerWeekTotal = 0;
    Object.values(worker.entries[weekNum.toString()] || {}).forEach(dayPesajesArray => {
        workerWeekTotal += dayPesajesArray.reduce((s,v) => s + (v || 0), 0);
    });
    if(!worker.weekTotals) worker.weekTotals = {};
    worker.weekTotals[weekNum.toString()] = workerWeekTotal;

    getDailyTotalsForWeek(mutableHarvest, weekNum); 
    getGrandTotalForWeek(mutableHarvest, weekNum); 

    onUpdateHarvest(mutableHarvest);
  };

  const handleWorkerNameChange = (weekNum: number, workerIndex: number, name: string) => {
    // weekNum is not strictly needed here if names are global to the worker across weeks
    // but kept for consistency if future logic makes names week-specific.
    const updatedWorkers = harvest.workers.map((w, idx) => 
      idx === workerIndex ? { ...w, name } : w
    );
    const updatedHarvest = { ...harvest, workers: updatedWorkers };
    onUpdateHarvest(updatedHarvest);
  };

  const handleDeleteWorker = (workerIndex: number) => { // weekNum removed as worker is deleted from all weeks
    const workerNameToDelete = harvest.workers[workerIndex].name;
    const updatedWorkers = harvest.workers.filter((_, idx) => idx !== workerIndex);
    
    const mutableHarvest = JSON.parse(JSON.stringify(harvest)) as Harvest;
    mutableHarvest.workers = updatedWorkers;

    mutableHarvest.weeks.forEach(wNum => {
        getDailyTotalsForWeek(mutableHarvest, wNum);
        getGrandTotalForWeek(mutableHarvest, wNum);
    });
    
    onUpdateHarvest(mutableHarvest);
    toast({ title: "Trabajador Eliminado", description: `Trabajador ${workerNameToDelete} eliminado de la cosecha.` });
  };

  const openAddSingleWorkerDialog = (weekNum: number) => {
    if (harvest.weeks.length === 0) {
      toast({ title: "Error", description: "Debe existir al menos una semana para añadir un trabajador.", variant: "destructive" });
      return;
    }
    setTargetWeekForSingleWorker(weekNum); // This might be simplified if worker is added to all weeks
    setShowAddSingleWorkerDialog(true);
  };
  
  const handleAddSingleWorker = () => {
    if (!newWorkerName.trim()) { // Target week no longer primary factor if added to all
      toast({ title: "Error", description: "Nombre de trabajador es requerido.", variant: "destructive" });
      return;
    }
    const newWorker: WorkerType = {
      id: Date.now(),
      name: newWorkerName.trim(),
      entries: {}, // Initialize entries object
      weekTotals: {} // Initialize weekTotals object
    };
    // Initialize entries and weekTotals for all existing weeks for the new worker
    harvest.weeks.forEach(wNum => {
      if (newWorker.entries) newWorker.entries[wNum.toString()] = initializeWeekEntriesForWorker();
      if (newWorker.weekTotals) newWorker.weekTotals[wNum.toString()] = 0;
    });

    const updatedHarvest = { ...harvest, workers: [...harvest.workers, newWorker] };
    onUpdateHarvest(updatedHarvest);
    toast({ title: "Trabajador Añadido", description: `${newWorker.name} añadido a todas las semanas existentes.` });
    setNewWorkerName('');
    setShowAddSingleWorkerDialog(false);
    setTargetWeekForSingleWorker(null);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentNotes(e.target.value);
  };

  const handleNotesBlur = () => {
    if (harvest.notes !== currentNotes) {
      onUpdateHarvest({ ...harvest, notes: currentNotes });
      toast({ title: "Notas Guardadas", description: "Las notas de la cosecha han sido actualizadas." });
    }
  };

  const harvestTotalKg = computeHarvestTotalKg(harvest);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={onBackToHarvests} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Cosechas
        </Button>
      </div>
      <h2 className="text-3xl font-semibold flex items-center">
        <CalendarDays className="mr-3 h-8 w-8 text-primary" /> Cosecha: {harvest.date} (ID: {harvest.id})
      </h2>
      <p className="text-xl font-medium">Total de Cosecha Actual: <span className="text-accent">{Math.floor(harvestTotalKg)}</span> kg</p>

      {harvest.saleInfo && (
        <Card className="bg-card/70 border-primary/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <DollarSign className="mr-2 h-6 w-6 text-primary" />
              Información de Venta Registrada
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <p><strong>Fecha de Venta:</strong> {harvest.saleInfo.saleDate}</p>
            <p><strong>Precio por Kilo:</strong> {harvest.saleInfo.pricePerKilo.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</p>
            <p><strong>Total Cosechado (al vender):</strong> {Math.floor(harvest.saleInfo.totalHarvestedKgAtSale)} kg</p>
            <p className="md:col-span-2"><strong>Ingreso Total por Venta:</strong> <span className="font-bold text-primary-foreground text-base">{harvest.saleInfo.totalSaleAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}</span></p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {(harvest.workers.length === 0 || harvest.weeks.length === 0) && <AddWorkersDialog onConfirm={handleAddWorkers} />}
        <Button onClick={handleAddWeek} variant="outline"><CalendarPlus className="mr-2 h-4 w-4" /> Añadir Semana</Button>
        
        {harvest.weeks.length > 0 && (
        <AlertDialog open={showAddSingleWorkerDialog} onOpenChange={setShowAddSingleWorkerDialog}>
            <AlertDialogTrigger asChild>
                {/* weekNum for openAddSingleWorkerDialog can be the first week or any, as worker is added to all */}
                <Button variant="outline" onClick={() => openAddSingleWorkerDialog(harvest.weeks[0]) }> 
                    <UserPlus2 className="mr-2 h-4 w-4" /> Añadir Trabajador a Tabla
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Añadir Trabajador</AlertDialogTitle>
                <AlertDialogDescription>
                    Ingrese el nombre del nuevo trabajador. Se añadirá a todas las semanas existentes.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-4 py-2">
                    <Label htmlFor="worker-name-single">Nombre del Trabajador</Label>
                    <Input id="worker-name-single" value={newWorkerName} onChange={(e) => setNewWorkerName(e.target.value)} placeholder="Nombre completo" />
                </div>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setNewWorkerName('')}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleAddSingleWorker}>Añadir</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        )}
        <PaymentModal harvest={harvest} lotId={lot.id} onSavePayment={onSavePayment} />
        <SaleRegistrationDialog harvest={harvest} lotId={lot.id} onSaveSaleInfo={onSaveSaleInfo} />
      </div>

      <AnimalInfoCard
        Icon={Trees} 
        text="Los cultivos de café que preservan los árboles nativos protegen a los anfibios y reptiles de la región."
      />

      <div className="mt-6 space-y-2">
        <Label htmlFor="harvest-notes" className="text-base font-medium flex items-center">
          <StickyNote className="mr-2 h-5 w-5 text-primary" />
          Notas Adicionales de la Cosecha
        </Label>
        <Textarea
          id="harvest-notes"
          placeholder="Añade observaciones sobre la cosecha (clima, plagas, fertilización, calidad, etc.)"
          value={currentNotes}
          onChange={handleNotesChange}
          onBlur={handleNotesBlur}
          className="mt-1 min-h-[100px] shadow-sm"
          rows={4}
        />
      </div>

      <div id="workers-container" className="space-y-8 mt-8">
        {harvest.weeks.length === 0 && harvest.workers.length > 0 && (
            <p className="text-center text-muted-foreground py-4">No hay semanas registradas. Presione "Añadir Semana".</p>
        )}
        {harvest.workers.length === 0 && (
             <p className="text-center text-muted-foreground py-4">No hay trabajadores registrados. Presione "Ingresar No. Trabajadores".</p>
        )}

        {harvest.weeks.sort((a,b) => a-b).map(weekNum => (
          <WorkerTable
            key={weekNum}
            weekNum={weekNum}
            workersData={harvest.workers}
            dailyTotalsForWeek={getDailyTotalsForWeek(harvest, weekNum)}
            grandTotalForWeek={getGrandTotalForWeek(harvest, weekNum)}
            onWorkerDataChange={(workerIdx, day, pesajes) => handleWorkerDataChange(weekNum, workerIdx, day, pesajes)}
            onWorkerNameChange={(workerIdx, name) => handleWorkerNameChange(weekNum, workerIdx, name)}
            onDeleteWorker={(workerIdx) => handleDeleteWorker(workerIdx)}
          />
        ))}
      </div>
    </div>
  );
}

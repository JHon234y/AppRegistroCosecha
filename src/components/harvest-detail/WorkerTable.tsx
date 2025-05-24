
"use client";
import type { Worker } from '@/types';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Lock, Unlock, Pencil } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface WorkerTableProps {
  weekNum: number;
  workersData: Worker[];
  dailyTotalsForWeek: { [day: string]: number };
  grandTotalForWeek: number;
  onWorkerDataChange: (workerIndex: number, day: string, newPesajesForDay: number[]) => void;
  onWorkerNameChange: (workerIndex: number, name: string) => void;
  onDeleteWorker: (workerIndex: number) => void;
}

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MAX_PESAJES_PER_DAY = 6;

export function WorkerTable({
  weekNum,
  workersData,
  dailyTotalsForWeek,
  grandTotalForWeek,
  onWorkerDataChange,
  onWorkerNameChange,
  onDeleteWorker,
}: WorkerTableProps) {

  const [lockedCells, setLockedCells] = useState<{ [key: string]: boolean }>({});
  const [currentInputValues, setCurrentInputValues] = useState<{ [key: string]: string }>({});
  const [lockedWorkerNames, setLockedWorkerNames] = useState<{ [workerIndex: string]: boolean }>({});
  const { toast } = useToast();

  useEffect(() => {
    const initialLockedPesajes: { [key: string]: boolean } = {};
    const initialInputs: { [key: string]: string } = {};

    workersData.forEach((worker, workerIndex) => {
      const weekEntries = worker.entries?.[weekNum.toString()] || {};
      DAYS_OF_WEEK.forEach(day => {
        const cellKey = `${workerIndex}_${day}_${weekNum}`;
        const pesajesForDay = weekEntries[day] || [];
        initialLockedPesajes[cellKey] = pesajesForDay.length >= MAX_PESAJES_PER_DAY || pesajesForDay.length > 0;
        initialInputs[cellKey] = '';
      });
    });

    setLockedCells(initialLockedPesajes);
    setCurrentInputValues(initialInputs);

    // Initialize/update lockedWorkerNames based on workersData, preserving existing states
    setLockedWorkerNames(prevLockedNames => {
      const newLockedState: { [key: string]: boolean } = {};
      let hasChanged = false;

      workersData.forEach((worker, workerIndex) => {
        const workerKey = workerIndex.toString();
        if (prevLockedNames.hasOwnProperty(workerKey)) {
          newLockedState[workerKey] = prevLockedNames[workerKey]; // Preserve existing lock state
        } else {
          // New worker, determine initial lock state
          const isDefaultName = worker.name === `Trabajador ${workerIndex + 1}` || worker.name.startsWith(`Trabajador `);
          newLockedState[workerKey] = (!isDefaultName && worker.name.trim() !== '');
          hasChanged = true; // Indicate that a new worker's lock state was added
        }
      });
      
      // Check if the number of workers changed (implies additions or removals)
      if (Object.keys(prevLockedNames).length !== workersData.length) {
        hasChanged = true;
      }

      // If nothing structurally changed and values are the same, return previous state reference
      if (!hasChanged && JSON.stringify(prevLockedNames) === JSON.stringify(newLockedState)) {
        return prevLockedNames;
      }
      return newLockedState;
    });

  }, [workersData, weekNum]); // REMOVED lockedWorkerNames from dependencies

  const getDaySum = (worker: Worker, day: string): number => {
    const pesajes = worker.entries?.[weekNum.toString()]?.[day] || [];
    return pesajes.reduce((sum, val) => sum + (val || 0), 0);
  };

  const handleInputChange = (cellKey: string, value: string) => {
    setCurrentInputValues(prev => ({ ...prev, [cellKey]: value }));
  };

  const handleSavePesaje = (workerIndex: number, day: string, cellKey: string) => {
    const inputValue = currentInputValues[cellKey];
    const currentPesajes = workersData[workerIndex].entries?.[weekNum.toString()]?.[day] || [];

    if (inputValue && inputValue.trim() !== "") {
      const numericValue = parseFloat(inputValue);
      if (!isNaN(numericValue) && numericValue >= 0) {
        if (currentPesajes.length < MAX_PESAJES_PER_DAY) {
          const newPesajesArray = [...currentPesajes, numericValue];
          onWorkerDataChange(workerIndex, day, newPesajesArray);
          setCurrentInputValues(prev => ({ ...prev, [cellKey]: '' })); // Clear input
          setLockedCells(prev => ({ ...prev, [cellKey]: true })); // Lock cell
        } else {
          toast({ title: "Límite Alcanzado", description: `Máximo de ${MAX_PESAJES_PER_DAY} pesajes por día.`, variant: "default" });
          setCurrentInputValues(prev => ({ ...prev, [cellKey]: '' }));
          if (!lockedCells[cellKey]) setLockedCells(prev => ({ ...prev, [cellKey]: true }));
        }
      } else {
        toast({ title: "Entrada Inválida", description: "Por favor, ingrese un número válido.", variant: "destructive" });
        setCurrentInputValues(prev => ({ ...prev, [cellKey]: '' })); // Clear invalid input
         if (lockedCells[cellKey] === false) { // If it was unlocked for input
             setLockedCells(prev => ({ ...prev, [cellKey]: true })); // Lock it back
        }
      }
    } else {
       // If input is empty and cell was unlocked, lock it back.
      if (lockedCells[cellKey] === false) {
        setLockedCells(prev => ({ ...prev, [cellKey]: true }));
      }
    }
  };

  const toggleLockCell = (workerIndex: number, day: string, cellKey: string) => {
    const pesajesForDay = workersData[workerIndex].entries?.[weekNum.toString()]?.[day] || [];
    if (lockedCells[cellKey]) { // If currently locked, try to unlock
      if (pesajesForDay.length < MAX_PESAJES_PER_DAY) {
        setLockedCells(prev => ({ ...prev, [cellKey]: false }));
      } else {
        toast({ title: "Límite Alcanzado", description: `No se pueden añadir más de ${MAX_PESAJES_PER_DAY} pesajes.`, variant: "default" });
      }
    } else { // If currently unlocked, lock it
      handleSavePesaje(workerIndex, day, cellKey); // Save any pending input before locking
      setLockedCells(prev => ({ ...prev, [cellKey]: true })); // Ensure it's locked
    }
  };

  const toggleWorkerNameLock = (workerIndex: number) => {
    setLockedWorkerNames(prev => ({
      ...prev,
      [workerIndex.toString()]: !prev[workerIndex.toString()]
    }));
  };

  const handleWorkerNameChange = (workerIndex: number, name: string) => {
    onWorkerNameChange(workerIndex, name);
  };
  
  const handleWorkerNameBlur = (workerIndex: number) => {
    const worker = workersData[workerIndex];
    // Check if the name is not empty and not the default placeholder pattern
    const isDefaultName = worker.name === `Trabajador ${workerIndex + 1}` || worker.name.startsWith(`Trabajador `);
    if (worker.name && worker.name.trim() !== '' && !isDefaultName) { 
      setLockedWorkerNames(prev => ({ ...prev, [workerIndex.toString()]: true }));
    }
  };

  // Helper to determine display value for worker name input
  const workerNameDisplayValue = (worker: Worker, workerIndex: number, isLocked: boolean): string => {
    const isDefaultName = worker.name === `Trabajador ${workerIndex + 1}` || worker.name.startsWith(`Trabajador `);
    if (!isLocked && isDefaultName && worker.name.trim() === `Trabajador ${workerIndex + 1}`) {
      return ''; // Show placeholder if unlocked and default name (e.g. "Trabajador 1")
    }
    return worker.name;
  };


  return (
    <div className="overflow-x-auto my-4 p-1 bg-card rounded-lg shadow-md">
      <h4 className="text-xl font-semibold mb-2 p-2">Semana {weekNum}</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[250px] md:min-w-[300px]">Trabajador</TableHead>
            {DAYS_OF_WEEK.map(day => (<TableHead key={day} className="min-w-[180px] md:min-w-[200px] text-center">{day}</TableHead>))}
            <TableHead className="text-center">Total Semana</TableHead>
            <TableHead className="w-[50px]">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workersData.map((worker, workerIndex) => {
            const workerKey = workerIndex.toString();
            const isNameLocked = lockedWorkerNames[workerKey] ?? false; // Default to false if not set, though useEffect should set it

            return (<TableRow key={worker.id || `${workerIndex}-${weekNum}`}>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Input
                    value={workerNameDisplayValue(worker, workerIndex, isNameLocked)}
                    placeholder="Ingrese nombre"
                    onChange={(e) => handleWorkerNameChange(workerIndex, e.target.value)}
                    onBlur={() => handleWorkerNameBlur(workerIndex)}
                    readOnly={isNameLocked}
                    className={cn(`w-full`, isNameLocked ? 'locked bg-muted/30 cursor-not-allowed' : '')}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleWorkerNameLock(workerIndex)}
                    className="p-1 h-8 w-8 flex-shrink-0"
                    title={isNameLocked ? "Editar nombre" : "Bloquear nombre"}
                  >
                    {isNameLocked ? <Pencil className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  </Button>
                </div>
              </TableCell>
              {DAYS_OF_WEEK.map(day => {
                const cellKey = `${workerIndex}_${day}_${weekNum}`;
                const pesajesForDay = worker.entries?.[weekNum.toString()]?.[day] || [];
                const isCellLocked = lockedCells[cellKey] ?? true;
                const canAddMorePesajes = pesajesForDay.length < MAX_PESAJES_PER_DAY;

                return (<TableCell key={cellKey} className="align-top p-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 mb-1">
                      <Input
                        type="number"
                        step="0.1"
                        value={currentInputValues[cellKey] || ''}
                        onChange={(e) => handleInputChange(cellKey, e.target.value)}
                        onBlur={() => handleSavePesaje(workerIndex, day, cellKey)}
                        className={cn(`p-1 h-8 text-sm flex-grow`, isCellLocked ? 'locked bg-muted/30 cursor-not-allowed' : '')}
                        readOnly={isCellLocked}
                        placeholder={isCellLocked && !canAddMorePesajes ? "Max." : (isCellLocked ? "Bloq." : "kg")}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="p-1 h-8 w-8 flex-shrink-0"
                        onClick={() => toggleLockCell(workerIndex, day, cellKey)}
                        disabled={isCellLocked && !canAddMorePesajes && pesajesForDay.length >= MAX_PESAJES_PER_DAY}
                        title={isCellLocked ? "Desbloquear pesaje" : "Bloquear pesaje"}
                      >
                        {isCellLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="text-xs min-h-[40px]">
                      <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
                        {pesajesForDay.map((p, idx) => (
                          <span key={idx} className="whitespace-nowrap mr-2">
                            P{idx + 1}:&nbsp;{p.toFixed(1)}{idx < pesajesForDay.length - 1 ? ',' : ''}
                          </span>
                        ))}
                      </div>
                      {pesajesForDay.length > 0 && (
                        <div className="day-sum pt-1 border-t border-border mt-1 text-right font-semibold">
                          Total:&nbsp;{Math.floor(getDaySum(worker, day))}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>);
              })}
              <TableCell className="text-center font-semibold align-middle">
                {Math.floor(worker.weekTotals?.[weekNum.toString()] || 0)}
              </TableCell>
              <TableCell className="align-middle">
                <Button variant="ghost" size="icon" onClick={() => onDeleteWorker(workerIndex)} className="text-destructive hover:text-destructive-foreground hover:bg-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>);
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="font-bold">Total Diario</TableCell>
            {DAYS_OF_WEEK.map(day => (
              <TableCell key={`footer-${day}-${weekNum}`} className="text-center font-bold">
                {Math.floor(dailyTotalsForWeek[day] || 0)}
              </TableCell>
            ))}
            <TableCell className="text-center font-bold">
              {Math.floor(grandTotalForWeek)}
            </TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}

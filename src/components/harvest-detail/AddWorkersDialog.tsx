"use client";

import { useState } from 'react';
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
import { UserPlus2 } from 'lucide-react'; // Changed from UserPlus

interface AddWorkersDialogProps {
  onConfirm: (count: number) => void;
  triggerButton?: React.ReactNode;
}

export function AddWorkersDialog({ onConfirm, triggerButton }: AddWorkersDialogProps) {
  const [open, setOpen] = useState(false);
  const [workerCount, setWorkerCount] = useState(1);

  const handleSubmit = () => {
    if (workerCount > 0) {
      onConfirm(workerCount);
      setOpen(false);
      setWorkerCount(1); // Reset for next time
    }
  };

  const trigger = triggerButton ? (
    <DialogTrigger asChild>{triggerButton}</DialogTrigger>
  ) : (
    <DialogTrigger asChild>
      <Button>
        <UserPlus2 className="mr-2 h-4 w-4" /> Ingresar No. Trabajadores
      </Button>
    </DialogTrigger>
  );


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Número de Trabajadores</DialogTitle>
          <DialogDescription>
            Ingrese la cantidad de trabajadores para esta semana de cosecha.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="worker-count" className="text-right col-span-2">
              No. Trabajadores
            </Label>
            <Input
              id="worker-count"
              type="number"
              min="1"
              value={workerCount}
              onChange={(e) => setWorkerCount(parseInt(e.target.value, 10) || 1)}
              className="col-span-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button type="submit" onClick={handleSubmit}>Aceptar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

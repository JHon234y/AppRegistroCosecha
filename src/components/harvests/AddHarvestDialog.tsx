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
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

interface AddHarvestDialogProps {
  onAddHarvest: (date: string) => void;
}

export function AddHarvestDialog({ onAddHarvest }: AddHarvestDialogProps) {
  const [open, setOpen] = useState(false);
  const [harvestDate, setHarvestDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const handleSubmit = () => {
    if (harvestDate) {
      onAddHarvest(harvestDate);
      setOpen(false);
      // Optionally reset date, but keeping it might be convenient
      // setHarvestDate(format(new Date(), 'yyyy-MM-dd')); 
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Añadir Cosecha
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Nueva Cosecha</DialogTitle>
          <DialogDescription>
            Seleccione la fecha para la nueva cosecha.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="harvest-date" className="text-right">
              Fecha
            </Label>
            <Input
              id="harvest-date"
              type="date"
              value={harvestDate}
              onChange={(e) => setHarvestDate(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button type="submit" onClick={handleSubmit}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

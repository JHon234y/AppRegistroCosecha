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

interface AddLotDialogProps {
  onAddLot: (name: string, owner: string) => void;
}

export function AddLotDialog({ onAddLot }: AddLotDialogProps) {
  const [open, setOpen] = useState(false);
  const [lotName, setLotName] = useState('');
  const [lotOwner, setLotOwner] = useState('');

  const handleSubmit = () => {
    if (lotName.trim() && lotOwner.trim()) {
      onAddLot(lotName.trim(), lotOwner.trim());
      setLotName('');
      setLotOwner('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Registrar Lote
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Lote</DialogTitle>
          <DialogDescription>
            Ingrese los detalles del nuevo lote.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lot-name" className="text-right">
              Nombre
            </Label>
            <Input
              id="lot-name"
              value={lotName}
              onChange={(e) => setLotName(e.target.value)}
              className="col-span-3"
              placeholder="Ej: Lote El Manantial"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lot-owner" className="text-right">
              Dueño
            </Label>
            <Input
              id="lot-owner"
              value={lotOwner}
              onChange={(e) => setLotOwner(e.target.value)}
              className="col-span-3"
              placeholder="Ej: Juan Pérez"
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

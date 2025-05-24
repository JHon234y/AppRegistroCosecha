"use client";

import type { Lot, AppData } from '@/types';
import { LotItem } from './LotItem';
import { AddLotDialog } from './AddLotDialog';
import { AnimalInfoCard } from '@/components/shared/AnimalInfoCard';
import { Button } from '@/components/ui/button';
import { MapPin, FolderOpen, Save, Bird } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface LotListViewProps {
  lots: Lot[];
  onAddLot: (name: string, owner: string) => void;
  onOpenLot: (lotId: number) => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
}

export function LotListView({ lots, onAddLot, onOpenLot, onOpenFile, onSaveFile }: LotListViewProps) {
  const { toast } = useToast();

  const handleSaveFile = () => {
    onSaveFile();
    toast({ title: "Guardado", description: "Los datos se han guardado en el archivo." });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold flex items-center">
          <MapPin className="mr-3 h-8 w-8 text-primary" /> Registro de Lotes
        </h2>
        <div className="flex space-x-2">
            <AddLotDialog onAddLot={onAddLot} />
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button onClick={onOpenFile} variant="outline">
          <FolderOpen className="mr-2 h-4 w-4" /> Abrir Archivo
        </Button>
        <Button onClick={handleSaveFile} variant="outline">
          <Save className="mr-2 h-4 w-4" /> Guardar en Archivo
        </Button>
      </div>

      <AnimalInfoCard
        Icon={Bird}
        text="Los cafetales de sombra son hábitat para más de 150 especies de aves y promueven la biodiversidad."
      />

      {lots.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No hay lotes registrados. ¡Añade uno para empezar!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lots.map((lot) => (
            <LotItem key={lot.id} lot={lot} onOpenLot={onOpenLot} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import type { Lot, Harvest } from '@/types';
import { HarvestItem } from './HarvestItem';
import { AddHarvestDialog } from './AddHarvestDialog';
import { AnimalInfoCard } from '@/components/shared/AnimalInfoCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Coffee, Bug } from 'lucide-react';

interface HarvestListViewProps {
  lot: Lot;
  onAddHarvest: (date: string) => void;
  onOpenHarvest: (harvestId: number) => void;
  onBackToLots: () => void;
}

export function HarvestListView({ lot, onAddHarvest, onOpenHarvest, onBackToLots }: HarvestListViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button onClick={onBackToLots} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Lotes
        </Button>
        <AddHarvestDialog onAddHarvest={onAddHarvest} />
      </div>
      
      <h2 className="text-3xl font-semibold flex items-center">
        <Coffee className="mr-3 h-8 w-8 text-primary" /> Cosechas del Lote: <span className="ml-2 text-accent">{lot.name}</span>
      </h2>

      <AnimalInfoCard
        Icon={Bug}
        text="El café cultivado en sombra protege a las abejas y otros polinizadores esenciales para el ecosistema."
      />

      {lot.harvests.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No hay cosechas registradas para este lote. ¡Añade una!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lot.harvests.map((harvest) => (
            <HarvestItem key={harvest.id} harvest={harvest} onOpenHarvest={onOpenHarvest} />
          ))}
        </div>
      )}
    </div>
  );
}

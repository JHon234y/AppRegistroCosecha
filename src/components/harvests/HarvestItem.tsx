
"use client";

import type { Harvest } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronRight, StickyNote } from 'lucide-react';
import { computeHarvestTotalKg } from '@/lib/utils';

interface HarvestItemProps {
  harvest: Harvest;
  onOpenHarvest: (harvestId: number) => void;
}

export function HarvestItem({ harvest, onOpenHarvest }: HarvestItemProps) {
  const totalKg = computeHarvestTotalKg(harvest);

  return (
    <Card className="mb-4 shadow-md hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Cosecha del {harvest.date}</CardTitle>
        <CardDescription>ID: {harvest.id}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm font-semibold">
              Total: {Math.floor(totalKg)} kg
            </p>
            {harvest.saleInfo && (
              <p className="text-sm text-primary font-medium">
                Venta: {harvest.saleInfo.totalSaleAmount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
              </p>
            )}
          </div>
          <Button onClick={() => onOpenHarvest(harvest.id)} size="sm" className="ml-auto">
            Abrir <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        {harvest.notes && harvest.notes.trim() !== "" && (
          <div className="mt-3 pt-2 border-t border-border/50">
            <div className="flex items-center text-xs text-muted-foreground mb-1">
              <StickyNote className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span className="font-medium">Notas:</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {harvest.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

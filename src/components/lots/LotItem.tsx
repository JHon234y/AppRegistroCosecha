"use client";

import type { Lot } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

interface LotItemProps {
  lot: Lot;
  onOpenLot: (lotId: number) => void;
}

export function LotItem({ lot, onOpenLot }: LotItemProps) {
  return (
    <Card className="mb-4 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl">{lot.name}</CardTitle>
        <CardDescription>Dueño: {lot.owner}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {lot.harvests.length} cosecha(s) registrada(s)
          </p>
          <Button onClick={() => onOpenLot(lot.id)} size="sm">
            Abrir Lote <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

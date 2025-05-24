import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AnimalInfoCardProps {
  Icon: LucideIcon;
  text: string;
}

export function AnimalInfoCard({ Icon, text }: AnimalInfoCardProps) {
  return (
    <Card className="my-6 bg-card/50 shadow-lg">
      <CardContent className="p-4 flex items-center gap-4">
        <Icon className="h-10 w-10 text-primary flex-shrink-0" />
        <p className="text-sm text-card-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}

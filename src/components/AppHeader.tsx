import { Leaf } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center">
        <Leaf className="h-8 w-8 text-primary mr-2" />
        <h1 className="text-2xl font-bold text-foreground">Registro de Cosechas</h1>
      </div>
    </header>
  );
}


"use client";

import { useState, useEffect, useCallback } from 'react';
import type { AppData, Lot, Harvest, AppView, Payment, HarvestSaleInfo } from '@/types';
import { loadDataFromDB, saveDataToDB } from '@/lib/db';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { LotListView } from '@/components/lots/LotListView';
import { HarvestListView } from '@/components/harvests/HarvestListView';
import { HarvestDetailView } from '@/components/harvest-detail/HarvestDetailView';
import { useToast } from "@/hooks/use-toast";
import { saveAs } from 'file-saver'; // For save file functionality


export default function HomePage() {
  const [data, setData] = useState<AppData | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('lots');
  const [currentLotId, setCurrentLotId] = useState<number | null>(null);
  const [currentHarvestId, setCurrentHarvestId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const loadedData = await loadDataFromDB();
    if (loadedData) {
      setData(loadedData);
    } else {
      // Initialize with default structure if loading fails or returns null
      setData({
        nextLotId: 1,
        nextHarvestId: 1,
        nextWorkerId: 1,
        lots: [],
      });
      toast({ title: "Datos no encontrados", description: "Se inició con datos vacíos.", variant: "default" });
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveData = useCallback(async (updatedData: AppData) => {
    setData(updatedData);
    await saveDataToDB(updatedData);
  }, []);

  // Lot Handlers
  const handleAddLot = (name: string, owner: string) => {
    if (!data) return;
    const newLot: Lot = {
      id: data.nextLotId,
      name,
      owner,
      harvests: [],
    };
    const updatedData: AppData = {
      ...data,
      lots: [...data.lots, newLot],
      nextLotId: data.nextLotId + 1,
    };
    saveData(updatedData);
    toast({ title: "Lote Añadido", description: `Lote "${name}" registrado con éxito.` });
  };

  const handleOpenLot = (lotId: number) => {
    setCurrentLotId(lotId);
    setCurrentView('harvests');
  };

  // Harvest Handlers
  const handleAddHarvest = (date: string) => {
    if (!data || currentLotId === null) return;
    const lotIndex = data.lots.findIndex(l => l.id === currentLotId);
    if (lotIndex === -1) return;

    const newHarvest: Harvest = {
      id: data.nextHarvestId,
      date,
      weeks: [],
      workers: [],
      dailyTotals: {},
      weeklyTotals: {},
      payments: [],
      notes: "", // Initialize notes
      // saleInfo: undefined // Implicitly undefined
    };
    const updatedLots = [...data.lots];
    updatedLots[lotIndex].harvests.push(newHarvest);
    
    const updatedData: AppData = {
      ...data,
      lots: updatedLots,
      nextHarvestId: data.nextHarvestId + 1,
    };
    saveData(updatedData);
    toast({ title: "Cosecha Añadida", description: `Cosecha para la fecha ${date} registrada.` });
  };

  const handleOpenHarvest = (harvestId: number) => {
    setCurrentHarvestId(harvestId);
    setCurrentView('harvest-detail');
  };
  
  const handleUpdateHarvest = (updatedHarvest: Harvest) => {
    if (!data || currentLotId === null) return;
    const lotIndex = data.lots.findIndex(l => l.id === currentLotId);
    if (lotIndex === -1) return;

    const harvestIndex = data.lots[lotIndex].harvests.findIndex(h => h.id === updatedHarvest.id);
    if (harvestIndex === -1) return;

    const updatedLots = [...data.lots];
    updatedLots[lotIndex].harvests[harvestIndex] = updatedHarvest;
    
    const updatedData = { ...data, lots: updatedLots };
    saveData(updatedData);
    // No toast here to avoid spamming on every minor data entry change, unless it's notes
    if (updatedHarvest.notes !== data.lots[lotIndex].harvests[harvestIndex].notes) {
      // This condition might be tricky if only notes are updated. The component itself can toast.
    }
  };

  const handleSavePayment = (paymentData: Payment) => {
     if (!data || !paymentData.lotId || !paymentData.harvestId) return;
      const lotIndex = data.lots.findIndex(l => l.id === paymentData.lotId);
      if (lotIndex === -1) return;

      const harvestIndex = data.lots[lotIndex].harvests.findIndex(h => h.id === paymentData.harvestId);
      if (harvestIndex === -1) return;

      const updatedLots = [...data.lots];
      if (!updatedLots[lotIndex].harvests[harvestIndex].payments) {
          updatedLots[lotIndex].harvests[harvestIndex].payments = [];
      }
      const newPaymentWithId = { ...paymentData, id: Date.now() }; // Use Date.now() for a simple unique ID
      updatedLots[lotIndex].harvests[harvestIndex].payments!.push(newPaymentWithId);
      
      const updatedData = { ...data, lots: updatedLots };
      saveData(updatedData);
      // Toast is handled in PaymentModal upon successful save
  };

  const handleSaveSaleInfo = (saleDetails: { harvestId: number; lotId: number; saleData: HarvestSaleInfo }) => {
    if (!data || !saleDetails.lotId || !saleDetails.harvestId) {
      toast({ title: "Error", description: "Faltan datos para guardar la venta.", variant: "destructive" });
      return;
    }
    const lotIndex = data.lots.findIndex(l => l.id === saleDetails.lotId);
    if (lotIndex === -1) {
      toast({ title: "Error", description: "Lote no encontrado.", variant: "destructive" });
      return;
    }

    const harvestIndex = data.lots[lotIndex].harvests.findIndex(h => h.id === saleDetails.harvestId);
    if (harvestIndex === -1) {
      toast({ title: "Error", description: "Cosecha no encontrada.", variant: "destructive" });
      return;
    }

    const updatedLots = [...data.lots];
    updatedLots[lotIndex].harvests[harvestIndex].saleInfo = saleDetails.saleData;
    
    const updatedData = { ...data, lots: updatedLots };
    saveData(updatedData);
    toast({ title: "Venta Registrada", description: "La información de la venta ha sido guardada." });
  };


  // File Handlers
  const handleOpenFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        toast({ title: "Archivo Seleccionado", description: `Cargando: ${file.name}`, variant: "default" });
        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const fileContent = e.target?.result as string;
            if (!fileContent || fileContent.trim() === '') {
               toast({ title: "Archivo Vacío", description: `El archivo "${file.name}" está vacío o no pudo ser leído.`, variant: "destructive" });
               return;
            }
            const fileData = JSON.parse(fileContent) as AppData;
            if (fileData && typeof fileData.nextLotId === 'number' && Array.isArray(fileData.lots)) {
              saveData(fileData);
              toast({ title: "Archivo Cargado", description: `Datos cargados desde "${file.name}".` });
              setCurrentView('lots');
            } else {
              throw new Error("Formato de archivo inválido.");
            }
          } catch (error) {
            console.error("Error parsing file:", error);
            toast({ title: "Error de Archivo", description: `No se pudo cargar el archivo "${file.name}". ${error instanceof Error ? error.message : 'Error desconocido.'}`, variant: "destructive" });
          }
        };

        reader.onerror = () => {
          console.error("Error reading file:", reader.error);
          toast({ title: "Error de Lectura", description: `No se pudo leer el contenido del archivo "${file.name}".`, variant: "destructive" });
        };
        
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleSaveFile = () => {
    if (!data) {
      toast({ title: "Sin Datos", description: "No hay datos para guardar.", variant: "destructive" });
      return;
    }
    try {
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8' });
      saveAs(blob, 'REGISTRO_DIARIO_COSECHA.json'); 
    } catch (error) {
      console.error("Error saving file:", error);
      toast({ title: "Error al Guardar", description: "No se pudo generar el archivo para guardar.", variant: "destructive" });
    }
  };


  // Navigation
  const navigateToLots = () => {
    setCurrentLotId(null);
    setCurrentHarvestId(null);
    setCurrentView('lots');
  };
  const navigateToHarvests = () => {
    setCurrentHarvestId(null);
    setCurrentView('harvests');
  };

  if (isLoading || !data) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 py-8">
          <p className="text-center text-xl">Cargando datos...</p>
        </main>
        <AppFooter />
      </div>
    );
  }
  
  const selectedLot = data.lots.find(l => l.id === currentLotId);
  const selectedHarvest = selectedLot?.harvests.find(h => h.id === currentHarvestId);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8">
        {currentView === 'lots' && (
          <LotListView
            lots={data.lots}
            onAddLot={handleAddLot}
            onOpenLot={handleOpenLot}
            onOpenFile={handleOpenFile}
            onSaveFile={handleSaveFile}
          />
        )}
        {currentView === 'harvests' && selectedLot && (
          <HarvestListView
            lot={selectedLot}
            onAddHarvest={handleAddHarvest}
            onOpenHarvest={handleOpenHarvest}
            onBackToLots={navigateToLots}
          />
        )}
        {currentView === 'harvest-detail' && selectedLot && selectedHarvest && (
          <HarvestDetailView
            lot={selectedLot}
            harvest={selectedHarvest}
            onUpdateHarvest={handleUpdateHarvest}
            onBackToHarvests={navigateToHarvests}
            onSavePayment={handleSavePayment}
            onSaveSaleInfo={handleSaveSaleInfo}
          />
        )}
      </main>
      <AppFooter />
    </div>
  );
}

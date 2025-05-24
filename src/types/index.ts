
export interface PesajeEntry {
  p1: number; // P.Mañana
  p2: number; // P.Mediodía
  p3: number; // P.Tarde
}

export interface DailyPesajes {
  [day: string]: number[]; // Example: "Lunes": [10.5, 12.0, 8.3]
}

export interface WeeklyEntries {
  [weekNum: string]: DailyPesajes; // Example: "1": { "Lunes": [10,10,10], ... }
}

export interface Worker {
  id: number;
  name: string;
  entries: WeeklyEntries; // All weighings for this worker across all weeks
  weekTotals: { [weekNum: string]: number }; // Total harvested by this worker for each week
}

export interface PaymentWorkerInfo {
  name: string;
  totalHarvested: number;
  workedDays: number;
  payment: number;
}
export interface Payment {
  id: number; // Timestamp or unique ID
  lotId: number;
  harvestId: number;
  date: string; // ISO date string
  paymentType: 'day' | 'kilo' | '';
  paymentRate: number;
  workers: PaymentWorkerInfo[];
  totals: {
    harvested: number;
    days: number;
    payment: number;
  };
}

export interface HarvestSaleInfo {
  saleDate: string; // YYYY-MM-DD
  pricePerKilo: number;
  totalSaleAmount: number;
  totalHarvestedKgAtSale: number; // Store the total kg at the time of sale
}

export interface Harvest {
  id: number;
  date: string; // YYYY-MM-DD
  weeks: number[]; // Array of week numbers, e.g., [1, 2, 3]
  workers: Worker[];
  dailyTotals: { [weekNum: string]: { [day: string]: number } }; // daily totals for the entire harvest per week
  weeklyTotals: { [weekNum: string]: { total: number } }; // grand total for each week
  payments?: Payment[];
  saleInfo?: HarvestSaleInfo;
  notes?: string; // Added for additional harvest notes
}

export interface Lot {
  id: number;
  name: string;
  owner: string;
  harvests: Harvest[];
}

export interface AppData {
  nextLotId: number;
  nextHarvestId: number;
  nextWorkerId: number;
  lots: Lot[];
}

// For view management
export type AppView = 'lots' | 'harvests' | 'harvest-detail';

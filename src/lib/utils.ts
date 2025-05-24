import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Harvest, Worker } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function computeWorkerTotalKg(worker: Worker): number {
  let total = 0;
  if (worker.entries) {
    Object.values(worker.entries).forEach(week => { // Iterate over weeks (e.g., week "1", "2")
      Object.values(week).forEach(dayPesajes => { // Iterate over days in a week (e.g., "Lunes", "Martes")
        total += dayPesajes.reduce((sum, val) => sum + (val || 0), 0);
      });
    });
  }
  return total;
}

export function computeHarvestTotalKg(harvest: Harvest): number {
  if (!harvest || !harvest.workers) return 0;
  return harvest.workers.reduce((acc, worker) => acc + computeWorkerTotalKg(worker), 0);
}

export function getDailyTotalsForWeek(harvest: Harvest, weekNum: number): { [day: string]: number } {
  const dailyTotals: { [day: string]: number } = {};
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  daysOfWeek.forEach(day => {
    let dayTotal = 0;
    harvest.workers.forEach(worker => {
      const weekEntries = worker.entries?.[weekNum.toString()];
      if (weekEntries && weekEntries[day]) {
        dayTotal += weekEntries[day].reduce((sum, val) => sum + val, 0);
      }
    });
    dailyTotals[day] = dayTotal;
  });
  
  // Also update harvest.dailyTotals for persistence if it's structured this way
  // This function is primarily for display calculation. Actual update should happen in state logic.
  if (harvest.dailyTotals && harvest.dailyTotals[weekNum.toString()]) {
     daysOfWeek.forEach(day => {
        if(harvest.dailyTotals[weekNum.toString()][day] === undefined) harvest.dailyTotals[weekNum.toString()][day] = 0; // Ensure init
        harvest.dailyTotals[weekNum.toString()][day] = dailyTotals[day];
     });
  } else if (harvest.dailyTotals) {
    harvest.dailyTotals[weekNum.toString()] = dailyTotals;
  }


  return dailyTotals;
}

export function getGrandTotalForWeek(harvest: Harvest, weekNum: number): number {
  const dailyTotals = getDailyTotalsForWeek(harvest, weekNum);
  let grandTotal = 0;
  Object.values(dailyTotals).forEach(dayTotal => {
    grandTotal += dayTotal;
  });
  
  // Also update harvest.weeklyTotals for persistence
  // This function is primarily for display calculation.
  if (harvest.weeklyTotals && harvest.weeklyTotals[weekNum.toString()]) {
    harvest.weeklyTotals[weekNum.toString()].total = grandTotal;
  } else if (harvest.weeklyTotals) {
     harvest.weeklyTotals[weekNum.toString()] = { total: grandTotal };
  }

  return grandTotal;
}

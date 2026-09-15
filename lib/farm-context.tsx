import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CropPlan, FarmState, InventoryItem, Transaction, initialState, loadFarmState, makeId, saveFarmState } from "@/lib/farm-data";

type FarmContextValue = {
  state: FarmState;
  ready: boolean;
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  addInventoryItem: (item: Omit<InventoryItem, "id" | "updatedAt">) => void;
  updateLocation: (location: FarmState["location"]) => void;
  updateCropStatus: (id: string, status: CropPlan["status"]) => void;
};
const FarmContext = createContext<FarmContextValue | null>(null);

export function FarmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FarmState>(initialState);
  const [ready, setReady] = useState(false);
  useEffect(() => { loadFarmState().then((next) => { setState(next); setReady(true); }); }, []);
  useEffect(() => { if (ready) void saveFarmState(state); }, [state, ready]);
  const value = useMemo<FarmContextValue>(() => ({
    state,
    ready,
    addTransaction: (transaction) => setState((current) => ({ ...current, transactions: [{ ...transaction, id: makeId("transaction") }, ...current.transactions] })),
    addInventoryItem: (item) => setState((current) => ({ ...current, inventory: [{ ...item, id: makeId("inventory"), updatedAt: new Date().toISOString() }, ...current.inventory] })),
    updateLocation: (location) => setState((current) => ({ ...current, location })),
    updateCropStatus: (id, status) => setState((current) => ({ ...current, cropPlans: current.cropPlans.map((plan) => plan.id === id ? { ...plan, status } : plan) })),
  }), [ready, state]);
  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}
export function useFarm() { const value = useContext(FarmContext); if (!value) throw new Error("useFarm deve ser usado dentro de FarmProvider"); return value; }

import AsyncStorage from "@react-native-async-storage/async-storage";

export type TransactionKind = "expense" | "revenue";

export type Transaction = {
  id: string;
  kind: TransactionKind;
  description: string;
  category: string;
  amount: number;
  date: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minimum: number;
  updatedAt: string;
};

export type CropPlan = {
  id: string;
  crop: "Banana" | "Batata-doce" | "Abobrinha verde";
  focus: string;
  recommendation: string;
  status: "planejado" | "em andamento" | "atenção";
};

export type FarmState = {
  transactions: Transaction[];
  inventory: InventoryItem[];
  cropPlans: CropPlan[];
  location: {
    latitude: number;
    longitude: number;
    label: string;
  };
};

export const STORAGE_KEY = "sitio-gestao-state-v1";

export const initialState: FarmState = {
  transactions: [],
  inventory: [],
  location: {
    // Referência inicial editável: o usuário deve ajustar para as coordenadas do sítio.
    latitude: -22.9068,
    longitude: -47.0628,
    label: "Localização de referência — ajuste no seu sítio",
  },
  cropPlans: [
    {
      id: "banana-plan",
      crop: "Banana",
      focus: "Plantio, manejo e venda",
      recommendation: "Acompanhe umidade do solo, vento e a cotação antes de definir a próxima janela.",
      status: "planejado",
    },
    {
      id: "sweet-potato-plan",
      crop: "Batata-doce",
      focus: "Plantio e colheita",
      recommendation: "Planeje o ciclo conforme a cultivar, o histórico da área e a demanda da praça escolhida.",
      status: "planejado",
    },
    {
      id: "zucchini-plan",
      crop: "Abobrinha verde",
      focus: "Colheita e venda",
      recommendation: "Faça colheitas frequentes e consulte a cotação para escolher o melhor canal de venda.",
      status: "planejado",
    },
  ],
};

export function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function loadFarmState(): Promise<FarmState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw) as Partial<FarmState>;
    return {
      ...initialState,
      ...parsed,
      transactions: parsed.transactions ?? [],
      inventory: parsed.inventory ?? [],
      cropPlans: parsed.cropPlans ?? initialState.cropPlans,
      location: parsed.location ?? initialState.location,
    };
  } catch {
    return initialState;
  }
}

export async function saveFarmState(state: FarmState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "R$ —";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export function formatFullDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

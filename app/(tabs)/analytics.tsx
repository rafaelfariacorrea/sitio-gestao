import { useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { AppHeader, EmptyState, PrimaryButton, SectionTitle } from "@/components/app-ui";
import { useFarm } from "@/lib/farm-context";
import { CropName, formatCurrency, formatDate } from "@/lib/farm-data";
import { exportCsv, exportPdf } from "@/lib/export-data";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

const cultures: CropName[] = ["Banana", "Batata-doce", "Abobrinha verde"];

export default function AnalyticsScreen() {
  const colors = useColors();
  const { state } = useFarm();
  const [feedback, setFeedback] = useState("");
  const expenses = state.transactions.filter((item) => item.kind === "expense");
  const revenue = state.transactions.filter((item) => item.kind === "revenue");
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0);

  const cashFlow = useMemo(() => {
    const buckets = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(); date.setMonth(date.getMonth() - (5 - index));
      return { key: `${date.getFullYear()}-${date.getMonth()}`, label: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""), income: 0, expense: 0 };
    });
    state.transactions.forEach((item) => {
      const date = new Date(item.date);
      const bucket = buckets.find((candidate) => candidate.key === `${date.getFullYear()}-${date.getMonth()}`);
      if (bucket) item.kind === "revenue" ? bucket.income += item.amount : bucket.expense += item.amount;
    });
    return buckets;
  }, [state.transactions]);
  const maxCash = Math.max(1, ...cashFlow.flatMap((item) => [item.income, item.expense]));
  const costByCulture = cultures.map((culture) => ({ culture, value: expenses.filter((item) => item.culture === culture).reduce((sum, item) => sum + item.amount, 0) }));
  const maxCultureCost = Math.max(1, ...costByCulture.map((item) => item.value));

  async function runExport(kind: "csv" | "pdf") {
    try { setFeedback("Preparando arquivo…"); kind === "csv" ? await exportCsv(state) : await exportPdf(state); setFeedback(`${kind.toUpperCase()} pronto para compartilhar.`); }
    catch (error) { setFeedback(error instanceof Error ? error.message : "Não foi possível exportar agora."); }
  }

  return <ScreenContainer className="px-5 pt-6" edges={["top", "left", "right"]}>
    <FlatList data={["analytics"]} keyExtractor={(item) => item} renderItem={() => null} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }} ListHeaderComponent={<View>
      <AppHeader eyebrow="ANÁLISES DO SÍTIO" title="Veja para onde vai o dinheiro" subtitle="Os gráficos usam somente os lançamentos cadastrados no aparelho." />
      <View className="mb-5 flex-row gap-2"><View className="flex-1 rounded-2xl border border-border bg-surface p-4"><Text className="text-xs text-muted">Receitas</Text><Text className="mt-1 text-lg font-bold text-success">{formatCurrency(totalRevenue)}</Text></View><View className="flex-1 rounded-2xl border border-border bg-surface p-4"><Text className="text-xs text-muted">Custos</Text><Text className="mt-1 text-lg font-bold text-error">{formatCurrency(totalExpenses)}</Text></View></View>
      <SectionTitle title="Fluxo de caixa · 6 meses" />
      {state.transactions.length ? <View className="mb-6 rounded-2xl border border-border bg-surface p-4"><View className="mb-3 flex-row justify-end gap-4"><View className="flex-row items-center"><View className="mr-1.5 h-2 w-2 rounded-full bg-success" /><Text className="text-xs text-muted">Entradas</Text></View><View className="flex-row items-center"><View className="mr-1.5 h-2 w-2 rounded-full bg-error" /><Text className="text-xs text-muted">Saídas</Text></View></View><View className="h-44 flex-row items-end justify-between gap-2">{cashFlow.map((item) => <View key={item.key} className="flex-1 items-center"><View className="h-36 w-full flex-row items-end justify-center gap-1"><View className="w-2 rounded-t-md bg-success" style={{ height: Math.max(item.income ? 5 : 0, 120 * item.income / maxCash) }} /><View className="w-2 rounded-t-md bg-error" style={{ height: Math.max(item.expense ? 5 : 0, 120 * item.expense / maxCash) }} /></View><Text className="mt-2 text-[10px] capitalize text-muted">{item.label}</Text></View>)}</View></View> : <View className="mb-6"><EmptyState icon="bar-chart" title="Sem dados para o gráfico" body="Registre receitas e despesas para acompanhar a evolução mensal." /></View>}
      <SectionTitle title="Custos por cultura" />
      {state.transactions.length ? <View className="mb-6 rounded-2xl border border-border bg-surface p-4">{costByCulture.map((item) => <View key={item.culture} className="mb-4 last:mb-0"><View className="mb-1 flex-row justify-between"><Text className="text-sm font-semibold text-foreground">{item.culture}</Text><Text className="text-sm font-bold text-foreground">{formatCurrency(item.value)}</Text></View><View className="h-3 overflow-hidden rounded-full bg-background"><View className="h-full rounded-full bg-primary" style={{ width: `${Math.max(item.value ? 4 : 0, 100 * item.value / maxCultureCost)}%` }} /></View></View>)}<Text className="mt-2 text-xs leading-4 text-muted">Associe cada despesa a uma cultura na tela Finanças para detalhar este gráfico.</Text></View> : <View className="mb-6"><EmptyState icon="agriculture" title="Custos ainda não distribuídos" body="Associe despesas à banana, batata-doce ou abobrinha verde." /></View>}
      <SectionTitle title="Exportar dados" />
      <View className="rounded-2xl border border-border bg-surface p-4"><Text className="text-sm leading-5 text-muted">Inclui todos os lançamentos financeiros e itens do inventário, com validade e cultura quando informadas.</Text><View className="mt-4 flex-row gap-2"><View className="flex-1"><PrimaryButton label="Baixar CSV" icon="file-download" onPress={() => runExport("csv")} /></View><View className="flex-1"><PrimaryButton label="Gerar PDF" icon="picture-as-pdf" onPress={() => runExport("pdf")} /></View></View>{feedback ? <Text className="mt-3 text-center text-xs font-semibold text-primary">{feedback}</Text> : null}</View>
    </View>} />
  </ScreenContainer>;
}

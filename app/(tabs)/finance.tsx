import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { AppHeader, EmptyState, Field, MetricCard, PrimaryButton, SectionTitle } from "@/components/app-ui";
import { CropName, formatCurrency, formatFullDate } from "@/lib/farm-data";
import { useFarm } from "@/lib/farm-context";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

type FormKind = "expense" | "revenue";
const crops: CropName[] = ["Banana", "Batata-doce", "Abobrinha verde"];

export default function FinanceScreen() {
  const colors = useColors();
  const { state, addTransaction } = useFarm();
  const [showForm, setShowForm] = useState(false); const [kind, setKind] = useState<FormKind>("expense"); const [description, setDescription] = useState(""); const [category, setCategory] = useState("Operação"); const [culture, setCulture] = useState<CropName | undefined>(); const [amount, setAmount] = useState(""); const [feedback, setFeedback] = useState("");
  const expenses = useMemo(() => state.transactions.filter((item) => item.kind === "expense").reduce((sum, item) => sum + item.amount, 0), [state.transactions]);
  const revenue = useMemo(() => state.transactions.filter((item) => item.kind === "revenue").reduce((sum, item) => sum + item.amount, 0), [state.transactions]);
  function submit() {
    const numericAmount = Number(amount.replace(",", "."));
    if (!description.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) { setFeedback("Informe uma descrição e um valor maior que zero."); return; }
    addTransaction({ kind, description: description.trim(), category: category.trim() || "Operação", culture, amount: numericAmount, date: new Date().toISOString() });
    setDescription(""); setCategory("Operação"); setCulture(undefined); setAmount(""); setShowForm(false); setFeedback("Lançamento salvo no aparelho.");
  }
  return <ScreenContainer className="px-5 pt-6" edges={["top", "left", "right"]}><FlatList data={state.transactions} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} ListHeaderComponent={<View>
    <AppHeader eyebrow="CONTROLE FINANCEIRO" title="Dinheiro do sítio" subtitle="Registre entradas e saídas para enxergar o resultado da operação." />
    <View className="mb-5 flex-row gap-2"><MetricCard label="Receitas" value={formatCurrency(revenue)} tone="positive" icon="arrow-upward" /><MetricCard label="Despesas" value={formatCurrency(expenses)} tone="negative" icon="arrow-downward" /></View>
    <PrimaryButton label={showForm ? "Fechar lançamento" : "Novo lançamento"} icon={showForm ? "close" : "add"} onPress={() => { setShowForm((value) => !value); setFeedback(""); }} />
    {showForm ? <View className="mt-4 rounded-2xl border border-border bg-surface p-4"><Text className="mb-3 text-sm font-bold text-foreground">O que deseja registrar?</Text><View className="mb-4 flex-row gap-2">{(["expense", "revenue"] as FormKind[]).map((option) => <Pressable key={option} onPress={() => setKind(option)} style={({ pressed }) => [{ borderColor: kind === option ? colors.primary : colors.border, backgroundColor: kind === option ? colors.primary : colors.background, opacity: pressed ? 0.8 : 1 }]} className="flex-1 rounded-xl border px-3 py-3"><Text className={`text-center text-sm font-bold ${kind === option ? "text-white" : "text-foreground"}`}>{option === "expense" ? "Despesa" : "Receita"}</Text></Pressable>)}</View><Field label="Descrição" placeholder={kind === "expense" ? "Ex.: adubo da área nova" : "Ex.: venda de banana"} value={description} onChangeText={setDescription} /><Field label="Categoria" placeholder="Energia, insumo, diária…" value={category} onChangeText={setCategory} /><Text className="mb-1.5 text-xs font-semibold text-muted">Cultura (opcional)</Text><View className="mb-3 flex-row gap-2">{crops.map((crop) => <Pressable key={crop} onPress={() => setCulture(culture === crop ? undefined : crop)} style={({ pressed }) => [{ borderColor: culture === crop ? colors.primary : colors.border, backgroundColor: culture === crop ? colors.primary : colors.background, opacity: pressed ? 0.8 : 1 }]} className="flex-1 rounded-xl border px-2 py-2.5"><Text className={`text-center text-xs font-semibold ${culture === crop ? "text-white" : "text-foreground"}`}>{crop.replace("Abobrinha verde", "Abobrinha")}</Text></Pressable>)}</View><Field label="Valor (R$)" placeholder="0,00" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" /><PrimaryButton label="Salvar lançamento" icon="check" onPress={submit} /></View> : null}
    {feedback ? <Text className="my-3 text-center text-sm font-semibold text-primary">{feedback}</Text> : null}<SectionTitle title={`Histórico · ${state.transactions.length} lançamentos`} />
  </View>} renderItem={({ item }) => <View className="mb-2 flex-row items-center rounded-2xl border border-border bg-surface p-4"><View className="rounded-xl bg-background p-2"><IconSymbol name={item.kind === "revenue" ? "arrow-upward" : "arrow-downward"} size={18} color={item.kind === "revenue" ? colors.success : colors.error} /></View><View className="ml-3 flex-1"><Text className="font-semibold text-foreground">{item.description}</Text><Text className="mt-1 text-xs text-muted">{item.category}{item.culture ? ` · ${item.culture}` : ""} · {formatFullDate(item.date)}</Text></View><Text className={`font-bold ${item.kind === "revenue" ? "text-success" : "text-error"}`}>{item.kind === "revenue" ? "+" : "−"}{formatCurrency(item.amount)}</Text></View>} ListEmptyComponent={<EmptyState icon="receipt-long" title="Nada lançado ainda" body="Comece registrando uma conta de energia, insumo, diária ou uma venda." />} contentContainerStyle={{ paddingBottom: 32 }} /></ScreenContainer>;
}

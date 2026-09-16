import { useEffect, useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { AppHeader, MetricCard, PrimaryButton, SectionTitle } from "@/components/app-ui";
import { useFarm } from "@/lib/farm-context";
import { formatCurrency, formatDate, isExpired, isExpiringSoon } from "@/lib/farm-data";
import { fetchMarketQuotes, fetchWeather, hasAvailableMarketQuote, MarketQuote, WeatherSnapshot, weatherLabel } from "@/lib/live-data";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { InstallAppCard } from "@/components/install-app";

export default function HomeScreen() {
  const colors = useColors();
  const { state, ready } = useFarm();
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [quotesReady, setQuotesReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const expenses = useMemo(() => state.transactions.filter((item) => item.kind === "expense").reduce((sum, item) => sum + item.amount, 0), [state.transactions]);
  const revenue = useMemo(() => state.transactions.filter((item) => item.kind === "revenue").reduce((sum, item) => sum + item.amount, 0), [state.transactions]);
  const balance = revenue - expenses;

  async function refreshLiveData() {
    setRefreshing(true);
    setQuotesReady(false);
    try {
      const [nextWeather, nextQuotes] = await Promise.all([fetchWeather(state.location.latitude, state.location.longitude), fetchMarketQuotes()]);
      setWeather(nextWeather);
      setQuotes(nextQuotes);
    } finally {
      setQuotesReady(true);
      setRefreshing(false);
    }
  }
  useEffect(() => { if (ready) void refreshLiveData(); }, [ready]);

  return (
    <ScreenContainer className="px-5 pt-6" edges={["top", "left", "right"]}>
      <FlatList
        data={["dashboard"]}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={refreshLiveData}
        renderItem={() => null}
        ListHeaderComponent={<View className="pb-8">
          <AppHeader eyebrow="SÍTIO GESTÃO" title="Bom dia, Rafael Correa." subtitle="Uma visão prática para você decidir o que fazer hoje no sítio." />
          <InstallAppCard />
          <View className="mb-5 rounded-3xl bg-primary p-5"><View className="flex-row items-center justify-between"><View className="flex-1 pr-3"><Text className="text-xs font-bold uppercase tracking-widest text-white/70">Saldo acumulado</Text><Text className="mt-2 text-3xl font-bold text-white">{formatCurrency(balance)}</Text><Text className="mt-1 text-sm leading-5 text-white/75">Receitas menos despesas lançadas neste aparelho.</Text></View><View className="rounded-2xl bg-white/15 p-3"><IconSymbol name="eco" size={30} color="#FFFFFF" /></View></View><View className="mt-5 flex-row gap-2"><View className="flex-1 rounded-2xl bg-white/10 p-3"><Text className="text-xs text-white/70">Entradas</Text><Text className="mt-1 font-bold text-white">{formatCurrency(revenue)}</Text></View><View className="flex-1 rounded-2xl bg-white/10 p-3"><Text className="text-xs text-white/70">Saídas</Text><Text className="mt-1 font-bold text-white">{formatCurrency(expenses)}</Text></View></View></View>
          <View className="mb-6 flex-row gap-2"><MetricCard label="Lançamentos" value={String(state.transactions.length)} icon="receipt-long" /><MetricCard label="Itens estoque" value={String(state.inventory.length)} icon="inventory-2" tone={state.inventory.length ? "positive" : "neutral"} /><MetricCard label="Alertas" value={String(state.inventory.filter((item) => item.quantity <= item.minimum || isExpired(item.expiresAt) || isExpiringSoon(item.expiresAt)).length)} icon="warning" tone={state.inventory.some((item) => item.quantity <= item.minimum || isExpired(item.expiresAt) || isExpiringSoon(item.expiresAt)) ? "warning" : "neutral"} /></View>
          {state.inventory.some((item) => item.quantity <= item.minimum || isExpired(item.expiresAt) || isExpiringSoon(item.expiresAt)) ? <View className="mb-6 rounded-2xl border border-warning bg-amber-50 p-4"><View className="flex-row items-center"><IconSymbol name="warning" size={19} color={colors.warning} /><Text className="ml-2 flex-1 text-sm font-semibold leading-5 text-foreground">Atenção: há itens abaixo do estoque mínimo ou com validade vencida/próxima.</Text></View></View> : null}
          <SectionTitle title="Condições de hoje" action={refreshing ? "Atualizando…" : "Atualizar"} onPress={refreshLiveData} />
          <View className="mb-6 rounded-2xl border border-border bg-surface p-4"><View className="flex-row items-center justify-between"><View className="flex-row items-center"><IconSymbol name="location-on" size={19} color={colors.primary} /><Text className="ml-2 flex-1 text-sm font-semibold text-foreground">{state.location.label}</Text></View><IconSymbol name="cloud" size={25} color={colors.primary} /></View><View className="mt-4 flex-row gap-2"><View className="flex-1 rounded-xl bg-background p-3"><Text className="text-xs text-muted">Agora</Text><Text className="mt-1 text-base font-bold text-foreground">{weather?.temperature !== null && weather ? `${weather.temperature}°C` : "—"}</Text><Text className="mt-1 text-xs text-muted">{weatherLabel(weather?.weatherCode ?? null)}</Text></View><View className="flex-1 rounded-xl bg-background p-3"><Text className="text-xs text-muted">Chuva</Text><Text className="mt-1 text-base font-bold text-foreground">{weather?.rainProbability !== null && weather ? `${weather.rainProbability}%` : "—"}</Text><Text className="mt-1 text-xs text-muted">probabilidade</Text></View><View className="flex-1 rounded-xl bg-background p-3"><Text className="text-xs text-muted">Vento</Text><Text className="mt-1 text-base font-bold text-foreground">{weather?.windSpeed !== null && weather ? `${weather.windSpeed}` : "—"}</Text><Text className="mt-1 text-xs text-muted">km/h</Text></View></View></View>
          <SectionTitle title="Cotações de referência" action="Ver safras" /><View className="mb-6 rounded-2xl border border-border bg-surface p-4">{!quotesReady ? <Text className="text-sm text-muted">Atualizando fonte Conab…</Text> : !hasAvailableMarketQuote(quotes) ? <Text className="text-sm leading-5 text-muted">Cotação indisponível para estas culturas no momento. Nenhum preço estimado foi exibido.</Text> : quotes.map((quote) => <View key={quote.product} className="mb-3 flex-row items-center justify-between last:mb-0"><View className="flex-row items-center"><View className="h-2 w-2 rounded-full bg-success" /><Text className="ml-2 text-sm font-semibold text-foreground">{quote.product}</Text></View><Text className="font-bold text-foreground">{formatCurrency(quote.value)} / {quote.unit}</Text></View>)}<Text className="mt-3 text-xs leading-4 text-muted">Referência de atacado. O preço pago ao produtor depende de qualidade, volume, praça e negociação.</Text></View>
          <SectionTitle title="Ações rápidas" /><View className="flex-row gap-2"><View className="flex-1"><PrimaryButton label="Lançar despesa" icon="arrow-downward" onPress={() => router.push("/(tabs)/finance")} /></View><View className="flex-1"><PrimaryButton label="Registrar receita" icon="arrow-upward" onPress={() => router.push("/(tabs)/finance")} /></View></View><Text className="mt-2 text-center text-xs text-muted">Use as abas Finanças, Estoque e Safras para registrar dados.</Text>
          {state.transactions.length > 0 ? <View className="mt-7"><SectionTitle title="Últimos lançamentos" /><View className="rounded-2xl border border-border bg-surface p-4">{state.transactions.slice(0, 3).map((item) => <View key={item.id} className="mb-3 flex-row items-center justify-between last:mb-0"><View className="flex-1"><Text className="font-semibold text-foreground">{item.description}</Text><Text className="mt-1 text-xs text-muted">{item.category} · {formatDate(item.date)}</Text></View><Text className={`font-bold ${item.kind === "revenue" ? "text-success" : "text-error"}`}>{item.kind === "revenue" ? "+" : "−"}{formatCurrency(item.amount)}</Text></View>)}</View></View> : null}
        </View>}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </ScreenContainer>
  );
}

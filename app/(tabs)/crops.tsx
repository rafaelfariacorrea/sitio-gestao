import { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { AppHeader, SectionTitle } from "@/components/app-ui";
import { useFarm } from "@/lib/farm-context";
import { formatCurrency } from "@/lib/farm-data";
import { fetchMarketQuotes, fetchWeather, MarketQuote, WeatherSnapshot, weatherLabel } from "@/lib/live-data";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function CropsScreen() {
  const colors = useColors();
  const { state, updateCropStatus } = useFarm();
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  async function refresh() {
    setRefreshing(true);
    const [nextWeather, nextQuotes] = await Promise.all([fetchWeather(state.location.latitude, state.location.longitude), fetchMarketQuotes()]);
    setWeather(nextWeather); setQuotes(nextQuotes); setRefreshing(false);
  }
  useEffect(() => { void refresh(); }, []);

  return (
    <ScreenContainer className="px-5 pt-6" edges={["top", "left", "right"]}>
      <FlatList
        data={state.cropPlans}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={refresh}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<View>
          <AppHeader eyebrow="PLANEJAMENTO DE SAFRAS" title="Plantar, colher, vender" subtitle="Cruze ciclo, condição do tempo e referência de mercado. A decisão final continua sendo do produtor." />
          <View className="mb-5 rounded-2xl border border-border bg-surface p-4"><View className="flex-row items-center justify-between"><View><Text className="text-xs font-bold uppercase tracking-widest text-primary">Janela de hoje</Text><Text className="mt-1 text-lg font-bold text-foreground">{weatherLabel(weather?.weatherCode ?? null)}</Text></View><IconSymbol name="wb-sunny" size={30} color={colors.warning} /></View><View className="mt-4 flex-row gap-2"><View className="flex-1 rounded-xl bg-background p-3"><Text className="text-xs text-muted">Temperatura</Text><Text className="mt-1 font-bold text-foreground">{weather?.temperature !== null && weather ? `${weather.temperature}°C` : "—"}</Text></View><View className="flex-1 rounded-xl bg-background p-3"><Text className="text-xs text-muted">Chuva</Text><Text className="mt-1 font-bold text-foreground">{weather?.rainProbability !== null && weather ? `${weather.rainProbability}%` : "—"}</Text></View><View className="flex-1 rounded-xl bg-background p-3"><Text className="text-xs text-muted">Vento</Text><Text className="mt-1 font-bold text-foreground">{weather?.windSpeed !== null && weather ? `${weather.windSpeed} km/h` : "—"}</Text></View></View><Text className="mt-3 text-xs leading-4 text-muted">O clima é uma indicação operacional, não substitui o acompanhamento local da lavoura.</Text></View>
          <SectionTitle title="Referência de mercado" action={refreshing ? "Atualizando…" : "Atualizar"} onPress={refresh} />
          <View className="mb-5 rounded-2xl border border-border bg-surface p-4">{quotes.map((quote) => <View key={quote.product} className="mb-3 flex-row items-center justify-between last:mb-0"><Text className="font-semibold text-foreground">{quote.product}</Text><Text className="font-bold text-foreground">{formatCurrency(quote.value)} / {quote.unit}</Text></View>)}<Text className="mt-2 text-xs leading-4 text-muted">Fonte: Conab / Prohort. É preço de atacado e pode não refletir a negociação na porteira.</Text></View>
          <SectionTitle title="Culturas acompanhadas" />
        </View>}
        renderItem={({ item }) => { const quote = quotes.find((candidate) => candidate.product === item.crop); return <View className="mb-3 rounded-2xl border border-border bg-surface p-4"><View className="flex-row items-start justify-between"><View className="flex-1 pr-2"><Text className="text-lg font-bold text-foreground">{item.crop}</Text><Text className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary">{item.focus}</Text></View><View className={`rounded-full px-3 py-1 ${item.status === "atenção" ? "bg-amber-100" : item.status === "em andamento" ? "bg-green-100" : "bg-background"}`}><Text className="text-xs font-bold text-foreground">{item.status}</Text></View></View><Text className="mt-3 text-sm leading-5 text-muted">{item.recommendation}</Text><View className="mt-3 flex-row items-center justify-between border-t border-border pt-3"><View className="flex-row items-center"><IconSymbol name="sell" size={17} color={colors.primary} /><Text className="ml-2 text-xs text-muted">Cotação referência: {quote ? `${formatCurrency(quote.value)} / ${quote.unit}` : "—"}</Text></View><Pressable onPress={() => updateCropStatus(item.id, item.status === "planejado" ? "em andamento" : item.status === "em andamento" ? "atenção" : "planejado")} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}><Text className="text-xs font-bold text-primary">Atualizar status</Text></Pressable></View></View>; }}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </ScreenContainer>
  );
}

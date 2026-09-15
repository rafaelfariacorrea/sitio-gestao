import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export function AppHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return <View className="mb-5"><Text className="text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</Text><Text className="mt-1 text-3xl font-bold leading-9 text-foreground">{title}</Text>{subtitle ? <Text className="mt-2 text-sm leading-5 text-muted">{subtitle}</Text> : null}</View>;
}

export function SectionTitle({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return <View className="mb-3 flex-row items-center justify-between"><Text className="text-base font-bold text-foreground">{title}</Text>{action && onPress ? <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.65 : 1 }]}><Text className="text-sm font-semibold text-primary">{action}</Text></Pressable> : null}</View>;
}

export function PrimaryButton({ label, onPress, icon = "add" }: { label: string; onPress: () => void; icon?: React.ComponentProps<typeof IconSymbol>["name"] }) {
  const colors = useColors();
  return <Pressable onPress={onPress} style={({ pressed }) => [{ backgroundColor: colors.primary, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}><IconSymbol name={icon} size={19} color="#FFFFFF" /><Text className="ml-2 font-bold text-white">{label}</Text></Pressable>;
}

export function MetricCard({ label, value, tone = "neutral", icon }: { label: string; value: string; tone?: "neutral" | "positive" | "negative" | "warning"; icon: React.ComponentProps<typeof IconSymbol>["name"] }) {
  const colors = useColors();
  const iconColor = tone === "positive" ? colors.success : tone === "negative" ? colors.error : tone === "warning" ? colors.warning : colors.primary;
  return <View className="min-w-[30%] flex-1 rounded-2xl border border-border bg-surface p-3"><IconSymbol name={icon} size={18} color={iconColor} /><Text className="mt-3 text-xs text-muted">{label}</Text><Text className="mt-1 text-lg font-bold text-foreground">{value}</Text></View>;
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return <View className="mb-3"><Text className="mb-1.5 text-xs font-semibold text-muted">{label}</Text><TextInput {...props} placeholderTextColor="#91A297" className="rounded-xl border border-border bg-background px-3.5 py-3 text-foreground" /></View>;
}

export function EmptyState({ icon, title, body }: { icon: React.ComponentProps<typeof IconSymbol>["name"]; title: string; body: string }) {
  const colors = useColors();
  return <View className="items-center rounded-2xl border border-dashed border-border bg-surface px-5 py-8"><IconSymbol name={icon} size={30} color={colors.muted} /><Text className="mt-3 text-center font-bold text-foreground">{title}</Text><Text className="mt-1 text-center text-sm leading-5 text-muted">{body}</Text></View>;
}

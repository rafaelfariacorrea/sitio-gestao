import { useEffect, useState } from "react";
import { Platform, Text, View } from "react-native";
import { PrimaryButton } from "@/components/app-ui";

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

declare global {
  interface WindowEventMap { beforeinstallprompt: InstallPrompt; }
}

export function InstallAppCard() {
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const standalone = window.matchMedia?.("(display-mode: standalone)").matches;
    setInstalled(Boolean(standalone));
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js");
    const onInstall = (event: InstallPrompt) => { event.preventDefault(); setInstallPrompt(event); };
    window.addEventListener("beforeinstallprompt", onInstall);
    return () => window.removeEventListener("beforeinstallprompt", onInstall);
  }, []);

  if (Platform.OS !== "web" || installed) return null;
  async function install() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setInstallPrompt(null);
  }
  return <View className="mb-6 rounded-2xl border border-border bg-surface p-4"><Text className="text-sm font-bold text-foreground">Usar no computador</Text><Text className="mt-1 text-sm leading-5 text-muted">Instale o Sítio Gestão como um aplicativo no Windows, macOS ou Linux para abrir pelo menu do computador.</Text>{installPrompt ? <View className="mt-3"><PrimaryButton label="Instalar no computador" icon="download" onPress={install} /></View> : <Text className="mt-3 text-xs leading-4 text-muted">No Chrome ou Edge, use o ícone de instalação na barra de endereço ou o menu ⋮ → Instalar Sítio Gestão.</Text>}</View>;
}

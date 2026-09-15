import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FarmProvider } from "@/lib/farm-context";
import { ThemeProvider } from "@/lib/theme-provider";
import { useEffect } from "react";
import { Platform } from "react-native";

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    document.title = "Sítio Gestão — Rafael Correa";
    let manifest = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!manifest) { manifest = document.createElement("link"); manifest.rel = "manifest"; document.head.appendChild(manifest); }
    manifest.href = "/manifest.json";
    let theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!theme) { theme = document.createElement("meta"); theme.name = "theme-color"; document.head.appendChild(theme); }
    theme.content = "#2F6B45";
  }, []);
  return (
    <ThemeProvider>
      <FarmProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="oauth/callback" />
        </Stack>
      </FarmProvider>
    </ThemeProvider>
  );
}

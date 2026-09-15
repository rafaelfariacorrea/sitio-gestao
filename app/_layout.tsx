import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FarmProvider } from "@/lib/farm-context";
import { ThemeProvider } from "@/lib/theme-provider";

export default function RootLayout() {
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

import "./scripts/load-env.js";
import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Sítio Gestão",
  slug: "sitio-gestao",
  owner: "rafaelfariacorrea",
  extra: { eas: { projectId: "d13c59a9-3408-4405-8a31-09ce4c04eee5" } },
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "sitiogestao",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: { supportsTablet: true, requireFullScreen: false, bundleIdentifier: "space.manus.sitio.gestao", entitlements: { "aps-environment": "production" }, infoPlist: { ITSAppUsesNonExemptEncryption: false } },
  android: {
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "space.manus.sitio.gestao",
    permissions: ["POST_NOTIFICATIONS"],
  },
  web: { bundler: "metro", output: "static", favicon: "./assets/images/favicon.png" },
  plugins: ["expo-router", "expo-notifications", ["expo-location", { locationWhenInUsePermission: "Permitir que o Sítio Gestão use a localização do sítio." }], "expo-splash-screen"],
  experiments: { typedRoutes: true, reactCompiler: true },
};

export default config;

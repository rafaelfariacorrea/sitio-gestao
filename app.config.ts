import "./scripts/load-env.js";
import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Sítio Gestão",
  slug: "sitio-gestao",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "sitiogestao",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: { supportsTablet: true, bundleIdentifier: "space.manus.sitio.gestao" },
  android: {
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "space.manus.sitio.gestao",
    permissions: ["POST_NOTIFICATIONS"],
  },
  web: { bundler: "metro", output: "static", favicon: "./assets/images/favicon.png" },
  plugins: ["expo-router", "expo-notifications", "expo-splash-screen"],
  experiments: { typedRoutes: true, reactCompiler: true },
};

export default config;

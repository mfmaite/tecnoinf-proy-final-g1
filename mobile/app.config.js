import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  name: "Mentora",
  slug: "mentora",
  version: "1.0.0",
  scheme: "mentora",
  orientation: "portrait",
  newArchEnabled: true,

  android: {
    ...config.android,
    package: "com.mentora.mobile",

    // 🔐 INYECTAMOS EL GOOGLE SERVICES DESDE SECRET, NO DESDE ARCHIVO LOCAL
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png"
    }
  },

  ios: {
    ...config.ios,
    bundleIdentifier: "com.mentora.mobile",
    supportsTablet: true,
    associatedDomains: ["applinks:mentora.app"]
  },

  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: { backgroundColor: "#000000" }
      }
    ],
    "expo-secure-store"
  ],

  web: {
    favicon: "./assets/images/favicon.ico",
    output: "static"
  },

  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    eas: { projectId: "6042f746-5d76-4884-bb96-d5c6febf9e72" }
  }
});

import { getDefaultConfig } from "expo/metro-config";
import path from "path";
import { fileURLToPath } from "url";

//  Como no existe __dirname en ESM, lo reconstruimos manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = getDefaultConfig(__dirname);

//  Agregamos soporte para SVG
config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== "svg");
config.resolver.sourceExts.push("svg");

export default config;

// getDefaultConfig(__dirname)  genera la configuración base de Expo Metro.

// babelTransformerPath  le indica a Metro que use react-native-svg-transformer para interpretar SVGs como componentes.

// assetExts.filter y sourceExts.push  hacen que los SVGs dejen de tratarse como simples imágenes estáticas y se importen como componentes React.
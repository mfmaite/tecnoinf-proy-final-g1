import React, { useMemo, useState } from "react";
import { Image, Text, View, StyleSheet, ViewStyle, TextStyle, ImageStyle } from "react-native";
import { SvgUri } from "react-native-svg";

type SizeKey = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

type Props = {
  name: string;
  pictureUrl?: string | null;
  size?: SizeKey;
  style?: ViewStyle;
};

export const UserProfilePicture: React.FC<Props> = ({ name, pictureUrl, size = "md", style }) => {
  const [error, setError] = useState<boolean>(false);

  const sizes: Record<SizeKey, { box: number; font: number }> = {
    sm: { box: 32, font: 12 },
    md: { box: 40, font: 14 },
    lg: { box: 48, font: 16 },
    xl: { box: 64, font: 18 },
    "2xl": { box: 80, font: 24 },
    "3xl": { box: 96, font: 28 },
  };

  const { box, font } = sizes[size];

  const bgColor = useMemo(() => {
    const colorPalette = [
      "#1f2937", "#334155", "#4f46e5", "#2563eb", "#0ea5e9", "#06b6d4", "#10b981",
      "#22c55e", "#84cc16", "#f59e0b", "#f97316", "#ef4444", "#ec4899", "#8b5cf6",
    ];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const idx = Math.abs(hash) % colorPalette.length;
    return colorPalette[idx];
  }, [name]);

  const initial = (name || "?").charAt(0).toUpperCase();
  const showImage = !!pictureUrl && !error;
  const isSvg = typeof pictureUrl === "string" && pictureUrl.toLowerCase().includes(".svg");

  return (
    <View style={[styles.container, { width: box, height: box }, style]}>
      {showImage ? (
        isSvg ? (
          <View
            style={[
              styles.placeholder,
              { width: box, height: box, borderRadius: box / 2, backgroundColor: "#fff", overflow: "hidden" } as ViewStyle,
            ]}
          >
            <SvgUri uri={pictureUrl as string} width={box} height={box} onError={() => setError(true)} />
          </View>
        ) : (
          <Image
            source={{ uri: pictureUrl as string }}
            onError={() => setError(true)}
            style={[styles.image, { width: box, height: box, borderRadius: box / 2 } as ImageStyle]}
            resizeMode="cover"
          />
        )
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: box, height: box, borderRadius: box / 2, backgroundColor: bgColor } as ViewStyle,
          ]}
        >
          <Text style={[styles.initial, { fontSize: font } as TextStyle]}>{initial}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    overflow: "hidden",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    color: "#ffffff",
    fontWeight: "600",
  },
});

export default UserProfilePicture;



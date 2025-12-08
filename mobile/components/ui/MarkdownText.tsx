import React from "react";
import { View, Text, Linking } from "react-native";

type Props = {
  text?: string | null;
};

export const MarkdownText: React.FC<Props> = ({ text }) => {
  if (!text) return null;

  const blocks: { type: "code" | "text"; content: string; lang?: string }[] = [];
  const lines = text.split(/\r?\n/);
  let inCode = false;
  let codeLang: string | undefined;
  let buffer: string[] = [];

  const flushText = () => {
    if (buffer.length) {
      blocks.push({ type: "text", content: buffer.join("\n") });
      buffer = [];
    }
  };

  for (const line of lines) {
    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      if (!inCode) {
        // entering code
        flushText();
        inCode = true;
        codeLang = fence[1] || undefined;
        buffer = [];
      } else {
        // leaving code
        blocks.push({ type: "code", content: buffer.join("\n"), lang: codeLang });
        buffer = [];
        codeLang = undefined;
        inCode = false;
      }
      continue;
    }
    buffer.push(line);
  }
  // flush remainder
  if (buffer.length) {
    if (inCode) {
      blocks.push({ type: "code", content: buffer.join("\n"), lang: codeLang });
    } else {
      blocks.push({ type: "text", content: buffer.join("\n") });
    }
  }

  const renderInline = (raw: string, keyPrefix: string) => {
    // Split on inline tokens and render with styles
    const parts = raw
      .split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g)
      .filter(Boolean);
    return (
      <Text>
        {parts.map((p, i) => {
          // bold
          const bold = p.match(/^\*\*([^*]+)\*\*$/);
          if (bold) return <Text key={`${keyPrefix}-b-${i}`} style={{ fontWeight: "700" }}>{bold[1]}</Text>;
          // italic
          const italic = p.match(/^\*([^*]+)\*$/);
          if (italic) return <Text key={`${keyPrefix}-i-${i}`} style={{ fontStyle: "italic" }}>{italic[1]}</Text>;
          // inline code
          const code = p.match(/^`([^`]+)`$/);
          if (code) {
            return (
              <Text
                key={`${keyPrefix}-c-${i}`}
                style={{
                  fontFamily: "monospace",
                  backgroundColor: "#f3f4f6",
                  paddingHorizontal: 4,
                  borderRadius: 4,
                }}
              >
                {code[1]}
              </Text>
            );
          }
          // link [label](url)
          const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
          if (link) {
            const label = link[1];
            const url = link[2];
            return (
              <Text
                key={`${keyPrefix}-l-${i}`}
                style={{ color: "#2563EB", textDecorationLine: "underline" }}
                onPress={async () => {
                  try {
                    const ok = await Linking.canOpenURL(url);
                    if (ok) await Linking.openURL(url);
                  } catch {}
                }}
              >
                {label}
              </Text>
            );
          }
          return <Text key={`${keyPrefix}-t-${i}`}>{p}</Text>;
        })}
      </Text>
    );
  };

  const renderTextBlock = (content: string, index: number) => {
    const ls = content.split(/\r?\n/);
    return (
      <View key={`tb-${index}`} style={{ gap: 6 }}>
        {ls.map((line, li) => {
          const heading = line.match(/^(#{1,3})\s+(.*)$/);
          if (heading) {
            const level = heading[1].length;
            const title = heading[2];
            return (
              <Text key={`h-${li}`} style={{ fontSize: level === 1 ? 22 : level === 2 ? 18 : 16, fontWeight: "700" }}>
                {title}
              </Text>
            );
          }
          const liMatch = line.match(/^[-*]\s+(.*)$/);
          const body = liMatch ? liMatch[1] : line;
          return (
            <Text key={`p-${li}`} style={{ fontSize: 14, color: "#1f2937" }}>
              {liMatch ? "• " : null}
              {renderInline(body, `in-${index}-${li}`)}
            </Text>
          );
        })}
      </View>
    );
  };

  return (
    <View style={{ gap: 10 }}>
      {blocks.map((b, i) =>
        b.type === "code" ? (
          <View
            key={`code-${i}`}
            style={{
              backgroundColor: "#0b1220",
              borderRadius: 8,
              padding: 10,
            }}
          >
            <Text style={{ color: "#e5e7eb", fontFamily: "monospace" }}>{b.content}</Text>
          </View>
        ) : (
          renderTextBlock(b.content, i)
        )
      )}
    </View>
  );
};



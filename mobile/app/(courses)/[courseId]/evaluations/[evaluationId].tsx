import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking, TextInput } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { styles } from "../../../../styles/styles";
import { getContentByType, Content } from "../../../../services/courses";
import { MarkdownText } from "../../../../components/ui/MarkdownText";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { createEvaluationSubmission, EvaluationSubmission, UploadFile } from "../../../../services/evaluations";
import * as ImagePicker from "expo-image-picker";

export const screenOptions = {
  title: "Evaluación",
  headerShown: true,
};

export default function EvaluationDetail() {
  const { courseId, evaluationId } = useLocalSearchParams<{ courseId?: string; evaluationId?: string }>();
  const [item, setItem] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [mySubmission, setMySubmission] = useState<EvaluationSubmission | null>(null);
  const [solution, setSolution] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<UploadFile | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!courseId || !evaluationId) return;
        const data = await getContentByType(String(courseId), "evaluation", String(evaluationId));
        const ev = (data && (data.evaluation || data)) as Content | undefined;
        if (ev) setItem(ev);
        const subs = (data?.submissions as EvaluationSubmission[] | undefined) ?? [];
        if (Array.isArray(subs) && subs.length > 0) {
          setMySubmission(subs[0]);
        } else {
          setMySubmission(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, evaluationId]);

  if (loading) return <View style={styles.loader} />;
  if (!item) return <Text style={styles.error}>Evaluación no encontrada.</Text>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.contentCard}>
        <Text style={[styles.name, { marginBottom: 6 }]}>{item.title || "Evaluación"}</Text>

        {item?.dueDate ? (
          <View style={styles.chipRow}>
            <View style={[styles.chip]}>
              <Text style={styles.chipText}>Evaluación</Text>
            </View>
            {(() => {
              const overdue = new Date(item.dueDate!) < new Date();
              return (
                <View style={[styles.chip, overdue ? styles.chipDanger : styles.chipMuted]}>
                  <Text style={overdue ? styles.chipDangerText : styles.chipMutedText}>
                    Vence: {new Date(item.dueDate!).toLocaleDateString("es-ES")}
                  </Text>
                </View>
              );
            })()}
          </View>
        ) : null}

        {item.content ? <View style={{ marginTop: 10 }}><MarkdownText text={item.content} /></View> : null}
        {item.fileUrl && item.fileName ? (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.contentFile}>Archivo: {item.fileName}</Text>
            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={async () => {
                try {
                  const dest = new Directory(Paths.document, item.fileName || `archivo_${Date.now()}`);
                  await dest.create();
                  const file = await File.downloadFileAsync(item.fileUrl!, dest);
                  const uri = file.uri;
                  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
                  else await Linking.openURL(uri);
                } catch (err) {
                  console.warn("[eval download] error", err);
                  try {
                    if (item.fileUrl) await Linking.openURL(item.fileUrl);
                  } catch {
                    Alert.alert("No se puede abrir el archivo.");
                  }
                }
              }}
            >
              <Text style={styles.buttonText}>Descargar</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {(() => {
          const overdue = item?.dueDate ? new Date(item.dueDate) < new Date() : false;
          if (mySubmission) {
            return (
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.subtitle, { marginBottom: 8 }]}>Tu entrega</Text>
                {mySubmission.fileUrl && (
                  <View style={{ marginBottom: 6 }}>
                    <Text style={styles.contentFile}>Archivo enviado: {mySubmission.fileName ?? "Archivo"}</Text>
                    <TouchableOpacity
                      style={[styles.buttonSecondary, { alignSelf: "flex-start" }]}
                      onPress={async () => {
                        try {
                          await Linking.openURL(mySubmission.fileUrl!);
                        } catch {
                          Alert.alert("No se puede abrir el archivo de la entrega.");
                        }
                      }}
                    >
                      <Text style={styles.buttonText}>Abrir archivo</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {mySubmission.solution ? (
                  <View style={{ marginTop: 6 }}>
                    <Text style={{ fontWeight: "700", marginBottom: 4 }}>Contenido:</Text>
                    <Text style={styles.contentText}>{mySubmission.solution}</Text>
                  </View>
                ) : null}
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.meta}>
                    Nota: {mySubmission.note != null ? String(mySubmission.note) : "Pendiente"}
                  </Text>
                </View>
              </View>
            );
          }

          if (overdue) {
            return (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.error}>La evaluación está vencida. No podés enviar una entrega.</Text>
              </View>
            );
          }

          return (
            <View style={{ marginTop: 12 }}>
              <Text style={[styles.subtitle, { marginBottom: 8 }]}>Enviar entrega</Text>
              <Text style={styles.meta}>Podés escribir tu solución en texto y/o adjuntar un archivo.</Text>
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontWeight: "600", marginBottom: 6 }}>Archivo (opcional)</Text>
                {selectedFile ? (
                  <View style={{ marginBottom: 8 }}>
                    <Text style={styles.contentFile}>Seleccionado: {selectedFile.name}</Text>
                    <TouchableOpacity
                      style={[styles.buttonSecondary, { alignSelf: "flex-start" }]}
                      onPress={() => setSelectedFile(null)}
                    >
                      <Text style={styles.buttonText}>Quitar archivo</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.buttonSecondary, { alignSelf: "flex-start" }]}
                    onPress={async () => {
                      try {
                        try {
                          // @ts-ignore - optional dependency, resolved at runtime if installed
                          const DocumentPicker: any = await import("expo-document-picker"); // eslint-disable-line import/no-unresolved
                          const res = await DocumentPicker.getDocumentAsync({
                            multiple: false,
                            copyToCacheDirectory: true,
                          });
                          if (res.type === "success" && res.assets?.[0]) {
                            const asset = res.assets[0];
                            const name = asset.name || asset.uri.split("/").pop() || "archivo";
                            const mime =
                              asset.mimeType ||
                              "application/octet-stream";
                            setSelectedFile({
                              uri: asset.uri,
                              name,
                              type: mime,
                            });
                            return;
                          }
                        } catch {
                        }

                        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (!permission.granted) {
                          Alert.alert("Permiso denegado", "Necesitamos acceso a tus archivos para adjuntarlos.");
                          return;
                        }
                        const result = await ImagePicker.launchImageLibraryAsync({
                          mediaTypes: ["images", "videos"],
                          quality: 0.8,
                        });
                        if (result.canceled || !result.assets?.[0]?.uri) return;
                        const asset = result.assets[0];
                        const uri = asset.uri;
                        const filename = uri.split("/").pop() || "archivo";
                        // Intentar inferir MIME por extensión
                        const ext = (filename.split(".").pop() || "").toLowerCase();
                        const mimeByExt: Record<string, string> = {
                          jpg: "image/jpeg",
                          jpeg: "image/jpeg",
                          png: "image/png",
                          pdf: "application/pdf",
                          txt: "text/plain",
                          doc: "application/msword",
                          docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                          xls: "application/vnd.ms-excel",
                          xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                          ppt: "application/vnd.ms-powerpoint",
                          pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                        };
                        const mime = mimeByExt[ext] || "application/octet-stream";
                        setSelectedFile({
                          uri,
                          name: filename,
                          type: mime,
                        });
                      } catch (err) {
                        console.warn("[eval attach] error", err);
                        Alert.alert("No se pudo seleccionar el archivo.");
                      }
                    }}
                  >
                    <Text style={styles.buttonText}>Seleccionar archivo</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontWeight: "600", marginBottom: 6 }}>Solución en texto</Text>
                <TextInput
                  value={solution}
                  onChangeText={setSolution}
                  multiline
                  numberOfLines={5}
                  placeholder="Escribí tu solución aquí..."
                  style={{
                    backgroundColor: "#fff",
                    borderColor: "#e5e7eb",
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 10,
                    minHeight: 100,
                    textAlignVertical: "top",
                  }}
                />
              </View>
              {submitError ? <Text style={[styles.error, { marginTop: 8 }]}>{submitError}</Text> : null}
              <TouchableOpacity
                style={[styles.buttonPrimary, { alignSelf: "flex-start", marginTop: 12, opacity: submitting ? 0.7 : 1 }]}
                disabled={
                  submitting ||
                  (!selectedFile && (!solution || solution.trim().length === 0))
                }
                onPress={async () => {
                  if (!evaluationId) return;
                  if (!selectedFile && (!solution || solution.trim().length === 0)) {
                    setSubmitError("Ingresá una solución en texto o adjuntá un archivo.");
                    return;
                  }
                  try {
                    setSubmitting(true);
                    setSubmitError(null);
                    const sub = await createEvaluationSubmission(String(evaluationId), {
                      solution,
                      file: selectedFile ?? undefined,
                    });
                    setMySubmission(sub);
                    setSolution("");
                    setSelectedFile(null);
                    Alert.alert("Entrega enviada correctamente.");
                  } catch (err: any) {
                    setSubmitError(err?.message || "No se pudo enviar la entrega.");
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                <Text style={styles.buttonText}>{submitting ? "Enviando..." : "Enviar"}</Text>
              </TouchableOpacity>
            </View>
          );
        })()}
      </View>
    </ScrollView>
  );
}



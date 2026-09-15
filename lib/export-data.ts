import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import { FarmState } from "@/lib/farm-data";
import { buildCsv, buildPdfHtml } from "@/lib/export-helpers";

export { buildCsv, buildPdfHtml } from "@/lib/export-helpers";

async function shareFile(uri: string, mimeType: string, filename: string) {
  if (Platform.OS === "web") {
    const response = await fetch(uri);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = filename; anchor.click();
    URL.revokeObjectURL(url);
    return;
  }
  if (!(await Sharing.isAvailableAsync())) throw new Error("Compartilhamento indisponível neste dispositivo");
  await Sharing.shareAsync(uri, { mimeType, dialogTitle: "Exportar dados do Sítio Gestão" });
}

export async function exportCsv(state: FarmState) {
  const filename = `sitio-gestao-${Date.now()}.csv`;
  if (Platform.OS === "web") {
    const dataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(buildCsv(state))}`;
    await shareFile(dataUri, "text/csv", filename);
    return;
  }
  const uri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, buildCsv(state), { encoding: FileSystem.EncodingType.UTF8 });
  await shareFile(uri, "text/csv", filename);
}

export async function exportPdf(state: FarmState) {
  if (Platform.OS === "web") {
    const printWindow = window.open("", "_blank");
    if (!printWindow) throw new Error("Permita janelas pop-up para gerar o PDF");
    printWindow.document.write(buildPdfHtml(state));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    return;
  }
  const { uri } = await Print.printToFileAsync({ html: buildPdfHtml(state) });
  await shareFile(uri, "application/pdf", `sitio-gestao-${Date.now()}.pdf`);
}

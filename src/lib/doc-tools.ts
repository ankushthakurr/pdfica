// Document, data, and utility helpers. 100% browser-side.
import { jsPDF } from "jspdf";
import { marked } from "marked";
import * as XLSX from "xlsx";
import QRCode from "qrcode";
import { loadPdfjs } from "./pdfjs";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// ---------- TEXT -> PDF ----------
export function textToPdfBlob(text: string): Blob {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageW = pdf.internal.pageSize.getWidth() - margin * 2;
  const pageH = pdf.internal.pageSize.getHeight() - margin * 2;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  let y = margin;
  const lh = 15;
  for (const para of text.split(/\n/)) {
    const lines = pdf.splitTextToSize(para || " ", pageW);
    for (const ln of lines) {
      if (y > margin + pageH) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(ln, margin, y);
      y += lh;
    }
  }
  return pdf.output("blob");
}

// ---------- MARKDOWN -> PDF (renders headings, paragraphs, lists) ----------
export async function markdownToPdfBlob(md: string): Promise<Blob> {
  const html = await marked.parse(md);
  const tmp = document.createElement("div");
  tmp.innerHTML = html as string;
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageW = pdf.internal.pageSize.getWidth() - margin * 2;
  const pageH = pdf.internal.pageSize.getHeight() - margin * 2;
  let y = margin;
  const writeBlock = (text: string, size: number, bold: boolean, indent = 0) => {
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(size);
    const lines = pdf.splitTextToSize(text, pageW - indent);
    for (const ln of lines) {
      if (y > margin + pageH) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(ln, margin + indent, y);
      y += size * 1.3;
    }
    y += 4;
  };
  const walk = (el: Element) => {
    for (const node of Array.from(el.children)) {
      const tag = node.tagName.toLowerCase();
      const text = (node.textContent || "").trim();
      if (!text) continue;
      if (/^h[1-6]$/.test(tag)) {
        const lvl = parseInt(tag[1], 10);
        writeBlock(text, 22 - lvl * 2, true);
      } else if (tag === "li") {
        writeBlock("• " + text, 11, false, 12);
      } else if (tag === "ul" || tag === "ol") {
        walk(node);
      } else {
        writeBlock(text, 11, false);
      }
    }
  };
  walk(tmp);
  return pdf.output("blob");
}

// ---------- CSV <-> EXCEL ----------
export async function csvToExcel(file: File): Promise<Blob> {
  const text = await file.text();
  const wb = XLSX.read(text, { type: "string" });
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  return new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

export async function excelToCsv(file: File): Promise<Blob> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const csv = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]);
  return new Blob([csv], { type: "text/csv" });
}

// ---------- CSV <-> JSON ----------
export async function csvToJson(file: File): Promise<Blob> {
  const text = await file.text();
  const wb = XLSX.read(text, { type: "string" });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  return new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
}

export async function jsonToCsv(file: File): Promise<Blob> {
  const text = await file.text();
  const data = JSON.parse(text);
  if (!Array.isArray(data)) throw new Error("JSON must be an array of objects.");
  const ws = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(ws);
  return new Blob([csv], { type: "text/csv" });
}

// ---------- PDF -> TEXT ----------
export async function pdfToText(file: File): Promise<Blob> {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await (await loadPdfjs()).getDocument({ data }).promise;
  let out = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    out += (tc.items as Array<{ str: string }>).map((x) => x.str).join(" ") + "\n\n";
  }
  return new Blob([out], { type: "text/plain" });
}

// ---------- PDF METADATA ----------
export async function pdfMetadata(file: File): Promise<Blob> {
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  const info = {
    fileName: file.name,
    fileSize: file.size,
    pageCount: src.getPageCount(),
    title: src.getTitle() ?? "",
    author: src.getAuthor() ?? "",
    subject: src.getSubject() ?? "",
    keywords: src.getKeywords() ?? "",
    producer: src.getProducer() ?? "",
    creator: src.getCreator() ?? "",
    creationDate: src.getCreationDate()?.toISOString() ?? "",
    modificationDate: src.getModificationDate()?.toISOString() ?? "",
  };
  return new Blob([JSON.stringify(info, null, 2)], { type: "application/json" });
}

// ---------- GRAYSCALE PDF (overlay desaturating filter via rasterize) ----------
export async function grayscalePdf(file: File): Promise<Blob> {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await (await loadPdfjs()).getDocument({ data }).promise;
  const out = await PDFDocument.create();
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const vp = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = vp.width;
    canvas.height = vp.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let p = 0; p < img.data.length; p += 4) {
      const g = img.data[p] * 0.299 + img.data[p + 1] * 0.587 + img.data[p + 2] * 0.114;
      img.data[p] = img.data[p + 1] = img.data[p + 2] = g;
    }
    ctx.putImageData(img, 0, 0);
    const jpg = canvas.toDataURL("image/jpeg", 0.85);
    const bytes = Uint8Array.from(atob(jpg.split(",")[1]), (c) => c.charCodeAt(0));
    const embed = await out.embedJpg(bytes);
    const p = out.addPage([vp.width / 2, vp.height / 2]);
    p.drawImage(embed, { x: 0, y: 0, width: p.getWidth(), height: p.getHeight() });
  }
  return new Blob([(await out.save()) as BlobPart], { type: "application/pdf" });
}

// ---------- N-UP PDF (multiple source pages on one sheet) ----------
export async function nUpPdf(file: File, perSheet: 2 | 4): Promise<Blob> {
  const srcBytes = await file.arrayBuffer();
  const src = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
  const out = await PDFDocument.create();
  const total = src.getPageCount();
  const A4 = [595.28, 841.89] as const;
  const cols = perSheet === 2 ? 1 : 2;
  const rows = 2;
  for (let i = 0; i < total; i += perSheet) {
    const page = out.addPage([A4[0], A4[1]]);
    const cellW = A4[0] / cols;
    const cellH = A4[1] / rows;
    const indices: number[] = [];
    for (let j = 0; j < perSheet && i + j < total; j++) indices.push(i + j);
    const embedded = await out.embedPdf(srcBytes, indices);
    for (let j = 0; j < embedded.length; j++) {
      const ep = embedded[j];
      const scale = Math.min(cellW / ep.width, cellH / ep.height) * 0.95;
      const w = ep.width * scale;
      const h = ep.height * scale;
      const col = j % cols;
      const row = perSheet === 2 ? 1 - j : 1 - Math.floor(j / cols);
      const x = col * cellW + (cellW - w) / 2;
      const y = row * cellH + (cellH - h) / 2;
      page.drawPage(ep, { x, y, width: w, height: h });
    }
  }
  return new Blob([(await out.save()) as BlobPart], { type: "application/pdf" });
}


// ---------- FLATTEN PDF (rasterize each page) ----------
export async function flattenPdf(file: File): Promise<Blob> {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await (await loadPdfjs()).getDocument({ data }).promise;
  const out = await PDFDocument.create();
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const vp = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = vp.width;
    canvas.height = vp.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
    const jpg = canvas.toDataURL("image/jpeg", 0.9);
    const bytes = Uint8Array.from(atob(jpg.split(",")[1]), (c) => c.charCodeAt(0));
    const embed = await out.embedJpg(bytes);
    const p = out.addPage([vp.width / 2, vp.height / 2]);
    p.drawImage(embed, { x: 0, y: 0, width: p.getWidth(), height: p.getHeight() });
  }
  return new Blob([(await out.save()) as BlobPart], { type: "application/pdf" });
}

// ---------- QR CODE ----------
export async function generateQrCode(text: string, size = 512): Promise<Blob> {
  if (!text.trim()) throw new Error("Enter text or a URL to encode.");
  const dataUrl = await QRCode.toDataURL(text, { width: size, margin: 2, errorCorrectionLevel: "M" });
  const bytes = Uint8Array.from(atob(dataUrl.split(",")[1]), (c) => c.charCodeAt(0));
  return new Blob([bytes], { type: "image/png" });
}

// ---------- PASSWORD GENERATOR ----------
export function generatePassword(length: number, opts: { upper: boolean; lower: boolean; digits: boolean; symbols: boolean }): string {
  const sets = [
    opts.upper && "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    opts.lower && "abcdefghijklmnopqrstuvwxyz",
    opts.digits && "0123456789",
    opts.symbols && "!@#$%^&*()-_=+[]{};:,.<>?",
  ].filter(Boolean) as string[];
  if (!sets.length) throw new Error("Select at least one character set.");
  const pool = sets.join("");
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  let out = "";
  for (let i = 0; i < length; i++) out += pool[arr[i] % pool.length];
  return out;
}

// ---------- LOREM IPSUM ----------
const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
export function loremIpsum(paragraphs: number): string {
  return Array.from({ length: paragraphs }, () => LOREM).join("\n\n");
}

// ---------- BASE64 ----------
export function encodeBase64(text: string): string {
  return btoa(unescape(encodeURIComponent(text)));
}
export function decodeBase64(text: string): string {
  try { return decodeURIComponent(escape(atob(text.trim()))); } catch { throw new Error("Invalid Base64 input."); }
}

// ---------- URL ENCODE ----------
export function encodeUrl(text: string): string { return encodeURIComponent(text); }
export function decodeUrl(text: string): string {
  try { return decodeURIComponent(text); } catch { throw new Error("Invalid URL-encoded input."); }
}

// ---------- HASH ----------
export async function hashText(text: string, algo: "SHA-1" | "SHA-256" | "SHA-512"): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest(algo, data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------- WORD COUNTER ----------
export interface TextStats { chars: number; charsNoSpaces: number; words: number; sentences: number; paragraphs: number; readingMinutes: number }
export function analyzeText(text: string): TextStats {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return {
    chars: text.length,
    charsNoSpaces: text.replace(/\s/g, "").length,
    words,
    sentences: (text.match(/[.!?]+/g) ?? []).length,
    paragraphs: text.split(/\n\s*\n/).filter((p) => p.trim()).length,
    readingMinutes: Math.max(1, Math.round(words / 200)),
  };
}

// ---------- CASE CONVERTER ----------
export type CaseKind = "upper" | "lower" | "title" | "sentence" | "snake" | "kebab" | "camel";
export function convertCase(text: string, kind: CaseKind): string {
  switch (kind) {
    case "upper": return text.toUpperCase();
    case "lower": return text.toLowerCase();
    case "title": return text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    case "sentence": return text.toLowerCase().replace(/(^|[.!?]\s+)([a-z])/g, (_, p, c) => p + c.toUpperCase());
    case "snake": return text.trim().replace(/\s+/g, "_").replace(/[^A-Za-z0-9_]/g, "").toLowerCase();
    case "kebab": return text.trim().replace(/\s+/g, "-").replace(/[^A-Za-z0-9-]/g, "").toLowerCase();
    case "camel": {
      const parts = text.toLowerCase().split(/[\s\W_]+/).filter(Boolean);
      return parts.map((w, i) => i === 0 ? w : w[0].toUpperCase() + w.slice(1)).join("");
    }
  }
}

// ---------- JSON FORMATTER ----------
export function formatJson(text: string, indent = 2): string {
  try { return JSON.stringify(JSON.parse(text), null, indent); } catch (e) { throw new Error("Invalid JSON: " + (e as Error).message); }
}

// ---------- PDF page counter (returns text blob with summary) ----------
export async function countPdfPages(file: File): Promise<number> {
  const src = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
  return src.getPageCount();
}

// Re-export so other files can use a single helper namespace
export { PDFDocument, rgb, StandardFonts };

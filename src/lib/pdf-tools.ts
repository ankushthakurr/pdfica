import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";
import JSZip from "jszip";
import { loadPdfjs } from "./pdfjs";
import { Document, Packer, Paragraph, TextRun } from "docx";
import mammoth from "mammoth";
import { jsPDF } from "jspdf";

const readAB = (f: File) => f.arrayBuffer();

// ----- Range parser shared -----
function parseRanges(ranges: string, total: number): number[] {
  const set = new Set<number>();
  if (!ranges.trim()) return Array.from({ length: total }, (_, i) => i);
  for (const part of ranges.split(",").map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!m) throw new Error(`Invalid range: ${part}`);
    const a = parseInt(m[1], 10);
    const b = m[2] ? parseInt(m[2], 10) : a;
    if (a < 1 || b > total || a > b) throw new Error(`Out-of-range: ${part}`);
    for (let i = a; i <= b; i++) set.add(i - 1);
  }
  return [...set].sort((x, y) => x - y);
}

// ----- MERGE -----
export type FileProgress = (index: number, phase: string, pct?: number) => void;

export async function mergePdfs(files: File[], report?: FileProgress): Promise<Blob> {
  const out = await PDFDocument.create();
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    report?.(i, "Reading", 10);
    const src = await PDFDocument.load(await readAB(f), { ignoreEncryption: true });
    report?.(i, "Copying pages", 55);
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
    report?.(i, "Done", 100);
  }
  return new Blob([(await out.save()) as BlobPart], { type: "application/pdf" });
}

// ----- SPLIT -----
export async function splitPdf(
  file: File,
  ranges: string,
): Promise<{ blob: Blob; filename: string }> {
  const src = await PDFDocument.load(await readAB(file), { ignoreEncryption: true });
  const total = src.getPageCount();
  const groups: number[][] = [];
  if (ranges.trim()) {
    for (const part of ranges.split(",").map((s) => s.trim()).filter(Boolean)) {
      const m = part.match(/^(\d+)(?:-(\d+))?$/);
      if (!m) throw new Error(`Invalid range: ${part}`);
      const a = parseInt(m[1], 10);
      const b = m[2] ? parseInt(m[2], 10) : a;
      if (a < 1 || b > total || a > b) throw new Error(`Out-of-range: ${part}`);
      groups.push(Array.from({ length: b - a + 1 }, (_, i) => a - 1 + i));
    }
  } else {
    for (let i = 0; i < total; i++) groups.push([i]);
  }

  if (groups.length === 1) {
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, groups[0]);
    pages.forEach((p) => out.addPage(p));
    return {
      blob: new Blob([(await out.save()) as BlobPart], { type: "application/pdf" }),
      filename: `${file.name.replace(/\.pdf$/i, "")}-split.pdf`,
    };
  }
  const zip = new JSZip();
  for (let i = 0; i < groups.length; i++) {
    const out = await PDFDocument.create();
    const pages = await out.copyPages(src, groups[i]);
    pages.forEach((p) => out.addPage(p));
    zip.file(`part-${i + 1}.pdf`, await out.save());
  }
  return {
    blob: await zip.generateAsync({ type: "blob" }),
    filename: `${file.name.replace(/\.pdf$/i, "")}-split.zip`,
  };
}

// ----- COMPRESS -----
export async function compressPdf(file: File): Promise<Blob> {
  const src = await PDFDocument.load(await readAB(file), {
    ignoreEncryption: true,
    updateMetadata: false,
  });
  src.setTitle("");
  src.setAuthor("");
  src.setSubject("");
  src.setKeywords([]);
  src.setProducer("");
  src.setCreator("");
  const bytes = await src.save({ useObjectStreams: true, addDefaultPage: false });
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}

// ----- PDF → JPG (page renderer) -----
export async function renderPdfPageJpg(
  pdf: { getPage: (n: number) => Promise<unknown> },
  pageNum: number,
  scale = 1.5,
  quality = 0.85,
): Promise<Blob> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const page: any = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d")!;
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return await new Promise<Blob>((res) =>
    canvas.toBlob((b) => res(b!), "image/jpeg", quality),
  );
}

export async function openPdf(file: File) {
  const data = new Uint8Array(await readAB(file));
  return await (await loadPdfjs()).getDocument({ data }).promise;
}

// Render all pages with controlled concurrency + progress callback.
export async function pdfToJpgPages(
  file: File,
  opts: { scale?: number; quality?: number; concurrency?: number; onProgress?: (done: number, total: number) => void } = {},
): Promise<{ blobs: Blob[]; numPages: number }> {
  const scale = opts.scale ?? 1.5;
  const quality = opts.quality ?? 0.85;
  const concurrency = Math.max(1, opts.concurrency ?? 3);
  const pdf = await openPdf(file);
  const total = pdf.numPages;
  const blobs: Blob[] = new Array(total);
  let done = 0;
  let next = 0;
  const workers = Array.from({ length: Math.min(concurrency, total) }, async () => {
    while (true) {
      const i = next++;
      if (i >= total) break;
      blobs[i] = await renderPdfPageJpg(pdf, i + 1, scale, quality);
      done++;
      opts.onProgress?.(done, total);
    }
  });
  await Promise.all(workers);
  return { blobs, numPages: total };
}

// Legacy single-blob convenience (kept for any other callers).
export async function pdfToJpgs(file: File, scale = 1.5): Promise<{ blob: Blob; filename: string }> {
  const base = file.name.replace(/\.pdf$/i, "");
  const { blobs } = await pdfToJpgPages(file, { scale });
  if (blobs.length === 1) return { blob: blobs[0], filename: `${base}.jpg` };
  const zip = new JSZip();
  blobs.forEach((b, i) => zip.file(`page-${String(i + 1).padStart(3, "0")}.jpg`, b));
  return { blob: await zip.generateAsync({ type: "blob" }), filename: `${base}-images.zip` };
}

// ----- JPG → PDF -----
export async function imagesToPdf(
  files: File[],
  pageSize: "fit" | "a4" = "fit",
): Promise<Blob> {
  const doc = await PDFDocument.create();
  for (const f of files) {
    const buf = await readAB(f);
    const img =
      f.type === "image/png"
        ? await doc.embedPng(buf)
        : await doc.embedJpg(buf);
    let pageW: number, pageH: number, drawW: number, drawH: number, x = 0, y = 0;
    if (pageSize === "a4") {
      pageW = 595.28;
      pageH = 841.89;
      const scale = Math.min((pageW - 40) / img.width, (pageH - 40) / img.height);
      drawW = img.width * scale;
      drawH = img.height * scale;
      x = (pageW - drawW) / 2;
      y = (pageH - drawH) / 2;
    } else {
      pageW = img.width;
      pageH = img.height;
      drawW = img.width;
      drawH = img.height;
    }
    const page = doc.addPage([pageW, pageH]);
    page.drawImage(img, { x, y, width: drawW, height: drawH });
  }
  return new Blob([(await doc.save()) as BlobPart], { type: "application/pdf" });
}

// ----- PDF → WORD -----
export async function pdfToWord(file: File): Promise<Blob> {
  const data = new Uint8Array(await readAB(file));
  const pdf = await (await loadPdfjs()).getDocument({ data }).promise;
  const paragraphs: Paragraph[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const text = await page.getTextContent();
    let line = "";
    let lastY: number | null = null;
    for (const item of text.items as Array<{ str: string; transform: number[] }>) {
      const y = item.transform[5];
      if (lastY !== null && Math.abs(y - lastY) > 2) {
        paragraphs.push(new Paragraph({ children: [new TextRun(line)] }));
        line = "";
      }
      line += item.str + " ";
      lastY = y;
    }
    if (line.trim()) paragraphs.push(new Paragraph({ children: [new TextRun(line)] }));
    if (i < pdf.numPages) paragraphs.push(new Paragraph({ children: [new TextRun("")] }));
  }
  const doc = new Document({ sections: [{ children: paragraphs }] });
  return Packer.toBlob(doc);
}

// ----- WORD → PDF -----
export async function wordToPdf(file: File): Promise<Blob> {
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer: await readAB(file) });
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageW = pdf.internal.pageSize.getWidth() - margin * 2;
  const pageH = pdf.internal.pageSize.getHeight() - margin * 2;
  let y = margin;
  const lineHeight = 16;
  const walk = (el: HTMLElement) => {
    for (const node of Array.from(el.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) continue;
      const e = node as HTMLElement;
      const tag = e.tagName?.toLowerCase();
      const text = (e.textContent || "").trim();
      if (!text) continue;
      const isHeading = tag && /^h[1-6]$/.test(tag);
      const fontSize = isHeading ? 18 - (parseInt(tag![1], 10) - 1) * 1.5 : 11;
      pdf.setFont("helvetica", isHeading ? "bold" : "normal");
      pdf.setFontSize(fontSize);
      const lines = pdf.splitTextToSize(text, pageW);
      for (const ln of lines) {
        if (y > margin + pageH) { pdf.addPage(); y = margin; }
        pdf.text(ln, margin, y);
        y += lineHeight * (isHeading ? 1.3 : 1);
      }
      y += isHeading ? 6 : 4;
    }
  };
  walk(tmp);
  return pdf.output("blob");
}

// ----- PROTECT (JS-prompt wrapper, honest fallback) -----
export async function protectAsZip(file: File, password: string): Promise<{ blob: Blob; filename: string }> {
  if (!password || password.length < 4) throw new Error("Use a password of at least 4 characters.");
  const src = await PDFDocument.load(await readAB(file), { ignoreEncryption: true });
  const js = `var p = app.response({cQuestion:"Enter password to open this PDF", cTitle:"Pdfica Protected", bPassword:true});` +
             `if (p !== ${JSON.stringify(password)}) { app.alert("Wrong password."); this.closeDoc(true); }`;
  src.addJavaScript("PdficaPasswordCheck", js);
  const bytes = await src.save();
  return {
    blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
    filename: file.name.replace(/\.pdf$/i, "") + "-protected.pdf",
  };
}

// ----- UNLOCK -----
export async function unlockPdf(file: File, _password = ""): Promise<Blob> {
  try {
    const src = await PDFDocument.load(await readAB(file), { ignoreEncryption: true });
    const bytes = await src.save();
    return new Blob([bytes as BlobPart], { type: "application/pdf" });
  } catch {
    throw new Error("This PDF uses strong encryption that can't be removed in-browser.");
  }
}

// ----- ORGANIZE -----
export interface OrganizeOp { pages: { index: number; rotation: number }[] }
export async function organizePdf(file: File, ops: OrganizeOp): Promise<Blob> {
  const src = await PDFDocument.load(await readAB(file), { ignoreEncryption: true });
  const out = await PDFDocument.create();
  const indices = ops.pages.map((p) => p.index);
  const copied = await out.copyPages(src, indices);
  copied.forEach((p, i) => {
    const rot = ops.pages[i].rotation % 360;
    if (rot) p.setRotation(degrees(rot));
    out.addPage(p);
  });
  return new Blob([(await out.save()) as BlobPart], { type: "application/pdf" });
}

// ----- THUMBNAILS (parallelized) -----
export async function renderPageThumbs(file: File, maxW = 180): Promise<string[]> {
  const data = new Uint8Array(await readAB(file));
  const pdf = await (await loadPdfjs()).getDocument({ data }).promise;
  const total = pdf.numPages;
  const out: string[] = new Array(total);
  const concurrency = Math.min(4, total);
  let next = 0;
  const work = async () => {
    while (true) {
      const i = next++;
      if (i >= total) break;
      const page = await pdf.getPage(i + 1);
      const vp1 = page.getViewport({ scale: 1 });
      const scale = maxW / vp1.width;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      out[i] = canvas.toDataURL("image/jpeg", 0.7);
    }
  };
  await Promise.all(Array.from({ length: concurrency }, work));
  return out;
}

// ===================== NEW TOOLS =====================

// ----- ROTATE -----
export async function rotatePdf(
  file: File,
  rotation: 90 | 180 | 270,
  rangesStr = "",
): Promise<Blob> {
  const src = await PDFDocument.load(await readAB(file), { ignoreEncryption: true });
  const total = src.getPageCount();
  const idxs = parseRanges(rangesStr, total);
  const targetSet = new Set(idxs);
  src.getPages().forEach((p, i) => {
    if (targetSet.has(i)) {
      const current = p.getRotation().angle;
      p.setRotation(degrees((current + rotation) % 360));
    }
  });
  const bytes = await src.save();
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}

// ----- EXTRACT PAGES -----
export async function extractPages(file: File, rangesStr: string): Promise<Blob> {
  if (!rangesStr.trim()) throw new Error("Enter page ranges to extract.");
  const src = await PDFDocument.load(await readAB(file), { ignoreEncryption: true });
  const idxs = parseRanges(rangesStr, src.getPageCount());
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, idxs);
  pages.forEach((p) => out.addPage(p));
  return new Blob([(await out.save()) as BlobPart], { type: "application/pdf" });
}

// ----- REMOVE PAGES -----
export async function removePages(file: File, rangesStr: string): Promise<Blob> {
  if (!rangesStr.trim()) throw new Error("Enter page ranges to remove.");
  const src = await PDFDocument.load(await readAB(file), { ignoreEncryption: true });
  const total = src.getPageCount();
  const remove = new Set(parseRanges(rangesStr, total));
  const keep = Array.from({ length: total }, (_, i) => i).filter((i) => !remove.has(i));
  if (!keep.length) throw new Error("You can't remove every page.");
  const out = await PDFDocument.create();
  const pages = await out.copyPages(src, keep);
  pages.forEach((p) => out.addPage(p));
  return new Blob([(await out.save()) as BlobPart], { type: "application/pdf" });
}

// ----- PAGE NUMBERS -----
export type NumberPosition = "bottom-center" | "bottom-right" | "bottom-left" | "top-center" | "top-right" | "top-left";
export async function addPageNumbers(
  file: File,
  position: NumberPosition = "bottom-center",
  format: "1" | "1/n" | "Page 1 of n" = "1",
): Promise<Blob> {
  const src = await PDFDocument.load(await readAB(file), { ignoreEncryption: true });
  const font = await src.embedFont(StandardFonts.Helvetica);
  const total = src.getPageCount();
  src.getPages().forEach((p, i) => {
    const { width, height } = p.getSize();
    const label = format === "1" ? `${i + 1}` : format === "1/n" ? `${i + 1}/${total}` : `Page ${i + 1} of ${total}`;
    const fs = 11;
    const w = font.widthOfTextAtSize(label, fs);
    const margin = 24;
    let x = (width - w) / 2;
    let y = margin;
    if (position.includes("right")) x = width - w - margin;
    if (position.includes("left")) x = margin;
    if (position.includes("top")) y = height - margin - fs;
    p.drawText(label, { x, y, size: fs, font, color: rgb(0.25, 0.25, 0.25) });
  });
  const bytes = await src.save();
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}

// ----- WATERMARK -----
export async function addWatermark(
  file: File,
  text: string,
  opacity = 0.25,
  angle = 45,
  size = 64,
): Promise<Blob> {
  if (!text.trim()) throw new Error("Enter watermark text.");
  const src = await PDFDocument.load(await readAB(file), { ignoreEncryption: true });
  const font = await src.embedFont(StandardFonts.HelveticaBold);
  src.getPages().forEach((p) => {
    const { width, height } = p.getSize();
    const tw = font.widthOfTextAtSize(text, size);
    p.drawText(text, {
      x: (width - tw) / 2,
      y: height / 2,
      font,
      size,
      color: rgb(0.85, 0.1, 0.1),
      opacity,
      rotate: degrees(angle),
    });
  });
  const bytes = await src.save();
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}

// ----- CROP -----
export async function cropPdf(file: File, marginPct = 5): Promise<Blob> {
  const src = await PDFDocument.load(await readAB(file), { ignoreEncryption: true });
  src.getPages().forEach((p) => {
    const { width, height } = p.getSize();
    const dx = (width * marginPct) / 100;
    const dy = (height * marginPct) / 100;
    p.setCropBox(dx, dy, width - 2 * dx, height - 2 * dy);
  });
  const bytes = await src.save();
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}

// ----- SIGN (place signature image on a page) -----
export async function signPdf(
  file: File,
  signaturePng: string, // dataURL
  page = 1,
  position: "bottom-right" | "bottom-left" | "bottom-center" = "bottom-right",
): Promise<Blob> {
  const src = await PDFDocument.load(await readAB(file), { ignoreEncryption: true });
  const pageIdx = Math.min(Math.max(page - 1, 0), src.getPageCount() - 1);
  const target = src.getPages()[pageIdx];
  const { width, height } = target.getSize();
  const pngBytes = Uint8Array.from(atob(signaturePng.split(",")[1]), (c) => c.charCodeAt(0));
  const img = await src.embedPng(pngBytes);
  const sigW = Math.min(220, width * 0.35);
  const sigH = (img.height / img.width) * sigW;
  const margin = 36;
  let x = width - sigW - margin;
  if (position === "bottom-left") x = margin;
  if (position === "bottom-center") x = (width - sigW) / 2;
  target.drawImage(img, { x, y: margin, width: sigW, height: sigH });
  const bytes = await src.save();
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}

// ----- EDIT (add a text annotation) -----
export async function editPdfAddText(
  file: File,
  text: string,
  page: number,
  xPct: number,
  yPct: number,
  size = 14,
  color: [number, number, number] = [0, 0, 0],
): Promise<Blob> {
  const src = await PDFDocument.load(await readAB(file), { ignoreEncryption: true });
  const pageIdx = Math.min(Math.max(page - 1, 0), src.getPageCount() - 1);
  const target = src.getPages()[pageIdx];
  const { width, height } = target.getSize();
  const font = await src.embedFont(StandardFonts.Helvetica);
  target.drawText(text, {
    x: (xPct / 100) * width,
    y: height - (yPct / 100) * height,
    font,
    size,
    color: rgb(color[0], color[1], color[2]),
  });
  const bytes = await src.save();
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}

// ----- REDACT (draw black rectangles) -----
export interface RedactBox { page: number; xPct: number; yPct: number; wPct: number; hPct: number }
export async function redactPdf(file: File, boxes: RedactBox[]): Promise<Blob> {
  if (!boxes.length) throw new Error("Add at least one redaction box.");
  const src = await PDFDocument.load(await readAB(file), { ignoreEncryption: true });
  for (const b of boxes) {
    const target = src.getPages()[b.page - 1];
    if (!target) continue;
    const { width, height } = target.getSize();
    target.drawRectangle({
      x: (b.xPct / 100) * width,
      y: height - ((b.yPct + b.hPct) / 100) * height,
      width: (b.wPct / 100) * width,
      height: (b.hPct / 100) * height,
      color: rgb(0, 0, 0),
    });
  }
  const bytes = await src.save();
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}

// ----- HTML → PDF -----
export async function htmlToPdf(html: string): Promise<Blob> {
  if (!html.trim()) throw new Error("Paste some HTML to convert.");
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageW = pdf.internal.pageSize.getWidth() - margin * 2;
  const pageH = pdf.internal.pageSize.getHeight() - margin * 2;
  let y = margin;
  const walk = (el: HTMLElement) => {
    for (const node of Array.from(el.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) continue;
      const e = node as HTMLElement;
      const tag = e.tagName?.toLowerCase();
      const text = (e.textContent || "").trim();
      if (!text) continue;
      const isHeading = tag && /^h[1-6]$/.test(tag);
      const fs = isHeading ? 22 - (parseInt(tag![1], 10) - 1) * 2 : 11;
      pdf.setFont("helvetica", isHeading ? "bold" : "normal");
      pdf.setFontSize(fs);
      const lines = pdf.splitTextToSize(text, pageW);
      for (const ln of lines) {
        if (y > margin + pageH) { pdf.addPage(); y = margin; }
        pdf.text(ln, margin, y);
        y += fs * 1.4;
      }
      y += isHeading ? 8 : 4;
    }
  };
  walk(tmp);
  return pdf.output("blob");
}

// ----- EXCEL → PDF -----
export async function excelToPdf(file: File): Promise<Blob> {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(await readAB(file), { type: "array" });
  const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  const margin = 36;
  const pageW = pdf.internal.pageSize.getWidth() - margin * 2;
  const pageH = pdf.internal.pageSize.getHeight() - margin * 2;
  let first = true;
  for (const name of wb.SheetNames) {
    if (!first) pdf.addPage();
    first = false;
    const sheet = wb.Sheets[name];
    const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false }) as string[][];
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text(name, margin, margin);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    let y = margin + 22;
    const colCount = Math.max(...rows.map((r) => r.length), 1);
    const colW = pageW / colCount;
    for (const row of rows) {
      if (y > margin + pageH) { pdf.addPage(); y = margin; }
      row.forEach((cell, i) => {
        const txt = String(cell ?? "").slice(0, 80);
        pdf.text(txt, margin + i * colW, y);
      });
      y += 14;
    }
  }
  return pdf.output("blob");
}

// ----- PDF → EXCEL -----
export async function pdfToExcel(file: File): Promise<Blob> {
  const XLSX = await import("xlsx");
  const data = new Uint8Array(await readAB(file));
  const pdf = await (await loadPdfjs()).getDocument({ data }).promise;
  const wb = XLSX.utils.book_new();
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const text = await page.getTextContent();
    const lines: Record<number, { x: number; str: string }[]> = {};
    for (const item of text.items as Array<{ str: string; transform: number[] }>) {
      const y = Math.round(item.transform[5]);
      lines[y] ??= [];
      lines[y].push({ x: item.transform[4], str: item.str });
    }
    const rows = Object.keys(lines)
      .map(Number)
      .sort((a, b) => b - a)
      .map((y) => lines[y].sort((a, b) => a.x - b.x).map((c) => c.str));
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, sheet, `Page ${i}`);
  }
  const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

// ----- OCR -----
export async function ocrPdfToText(
  file: File,
  onProgress?: (p: number, status: string) => void,
): Promise<Blob> {
  const Tesseract = (await import("tesseract.js")).default;
  const data = new Uint8Array(await readAB(file));
  const pdf = await (await loadPdfjs()).getDocument({ data }).promise;
  let combined = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    onProgress?.(((i - 1) / pdf.numPages) * 100, `OCR page ${i} of ${pdf.numPages}…`);
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const { data: { text } } = await Tesseract.recognize(canvas, "eng");
    combined += `--- Page ${i} ---\n${text}\n\n`;
  }
  onProgress?.(100, "Done");
  return new Blob([combined], { type: "text/plain" });
}

// ----- REPAIR (best effort: load + re-save) -----
export async function repairPdf(file: File): Promise<Blob> {
  try {
    const src = await PDFDocument.load(await readAB(file), {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
      updateMetadata: false,
    });
    const bytes = await src.save({ useObjectStreams: false });
    return new Blob([bytes as BlobPart], { type: "application/pdf" });
  } catch (e) {
    throw new Error("This PDF is too corrupted for an in-browser repair. Try a desktop tool like qpdf.");
  }
}

// ----- PDF/A (basic conformance hint) -----
export async function pdfToPdfA(file: File): Promise<Blob> {
  const src = await PDFDocument.load(await readAB(file), { ignoreEncryption: true });
  src.setProducer("Pdfica (PDF/A best-effort)");
  src.setTitle(src.getTitle() || file.name);
  const bytes = await src.save({ useObjectStreams: false });
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}

// ----- COMPARE (text diff) -----
async function extractAllText(file: File): Promise<string> {
  const data = new Uint8Array(await readAB(file));
  const pdf = await (await loadPdfjs()).getDocument({ data }).promise;
  let out = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    out += (tc.items as Array<{ str: string }>).map((it) => it.str).join(" ") + "\n";
  }
  return out;
}

export interface DiffLine { type: "same" | "add" | "del"; text: string }
export async function comparePdfs(a: File, b: File): Promise<DiffLine[]> {
  const [ta, tb] = await Promise.all([extractAllText(a), extractAllText(b)]);
  const la = ta.split(/\r?\n/);
  const lb = tb.split(/\r?\n/);
  // LCS diff
  const m = la.length, n = lb.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] = la[i] === lb[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: DiffLine[] = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (la[i] === lb[j]) { out.push({ type: "same", text: la[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ type: "del", text: la[i++] }); }
    else { out.push({ type: "add", text: lb[j++] }); }
  }
  while (i < m) out.push({ type: "del", text: la[i++] });
  while (j < n) out.push({ type: "add", text: lb[j++] });
  return out;
}

// ----- SCAN → PDF (from data URLs captured via camera) -----
export async function scanToPdf(images: string[]): Promise<Blob> {
  if (!images.length) throw new Error("Capture at least one page.");
  const doc = await PDFDocument.create();
  for (const dataUrl of images) {
    const b64 = dataUrl.split(",")[1];
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const img = dataUrl.startsWith("data:image/png")
      ? await doc.embedPng(bytes)
      : await doc.embedJpg(bytes);
    const page = doc.addPage([595.28, 841.89]);
    const scale = Math.min((page.getWidth() - 40) / img.width, (page.getHeight() - 40) / img.height);
    const w = img.width * scale, h = img.height * scale;
    page.drawImage(img, { x: (page.getWidth() - w) / 2, y: (page.getHeight() - h) / 2, width: w, height: h });
  }
  return new Blob([(await doc.save()) as BlobPart], { type: "application/pdf" });
}

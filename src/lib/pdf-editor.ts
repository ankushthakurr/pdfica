import { PDFDocument } from "pdf-lib";
import { loadPdfjs } from "./pdfjs";

export interface TextRegion {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
}
export interface TextEdit {
  text: string;
  fontSize: number;
  bold: boolean;
  color: string;
}
export interface EditorPage {
  width: number;
  height: number;
  image: string;
  regions: TextRegion[];
}
export type EditorEdits = Record<number, Record<string, TextEdit>>;
export const EDITOR_INK = { black: "#171717", red: "#c62828", blue: "#1565c0" };

export async function openEditorDocument(file: File) {
  return (await loadPdfjs()).getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
}
export async function readEditorPage(pdf: Awaited<ReturnType<typeof openEditorDocument>>, number: number): Promise<EditorPage> {
  const page = await pdf.getPage(number);
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser cannot display this PDF.");
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  const content = await page.getTextContent();
  const { Util } = await loadPdfjs();
  const regions: TextRegion[] = [];
  content.items.forEach((item, i) => {
    if (!("str" in item) || !item.str.trim()) return;
    const t = Util.transform(viewport.transform, item.transform);
    const height = Math.hypot(t[2], t[3]);
    const style = content.styles[item.fontName];
    const ascent = style?.ascent ?? 0.8;
    const x = t[4];
    const y = t[5] - height * ascent;
    regions.push({ id: `text-${i}`, text: item.str, x, y, width: Math.max(item.width * viewport.scale, 4), height: Math.max(height, 4), fontSize: height, fontFamily: style?.fontFamily?.includes("serif") && !style.fontFamily.includes("sans") ? "serif" : "sans-serif" });
  });
  page.cleanup();
  return { width: canvas.width, height: canvas.height, image: canvas.toDataURL("image/png"), regions };
}

export async function scanEditorPage(page: EditorPage, language: string, report: (progress: number) => void): Promise<TextRegion[]> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker(language, 1, { logger: (m) => { if (m.status === "recognizing text") report(Math.round(m.progress * 100)); } });
  try {
    const result = await worker.recognize(page.image, {}, { blocks: true });
    const regions: TextRegion[] = [];
    for (const block of result.data.blocks ?? []) for (const paragraph of block.paragraphs) for (const line of paragraph.lines) {
      const b = line.bbox;
      if (!line.text.trim()) continue;
      regions.push({ id: `scan-${regions.length}`, text: line.text.trim(), x: b.x0, y: b.y0, width: b.x1 - b.x0, height: b.y1 - b.y0, fontSize: (b.y1 - b.y0) * 0.9, fontFamily: "sans-serif" });
    }
    return regions;
  } finally { await worker.terminate(); }
}

async function pageCanvas(page: EditorPage) {
  const image = new Image();
  image.src = page.image;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = page.width; canvas.height = page.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Your browser cannot export this PDF.");
  ctx.drawImage(image, 0, 0);
  return { canvas, ctx };
}

export async function paintEditorPage(page: EditorPage, edits: Record<string, TextEdit>) {
  const { canvas, ctx } = await pageCanvas(page);
  // Erase all selected areas before writing to avoid covering a nearby replacement.
  for (const region of page.regions) {
    if (!edits[region.id]) continue;
    const sample = ctx.getImageData(Math.max(0, Math.min(page.width - 1, Math.floor(region.x - 3))), Math.max(0, Math.min(page.height - 1, Math.floor(region.y - 3))), 1, 1).data;
    ctx.fillStyle = `rgb(${sample[0]},${sample[1]},${sample[2]})`;
    ctx.fillRect(region.x - 1, region.y - 1, region.width + 2, region.height + 2);
  }
  for (const region of page.regions) {
    const edit = edits[region.id];
    if (!edit?.text) continue;
    ctx.font = `${edit.bold ? "bold " : ""}${edit.fontSize}px ${region.fontFamily}`;
    ctx.fillStyle = edit.color;
    ctx.textBaseline = "top";
    edit.text.split("\n").forEach((line, index) => ctx.fillText(line, region.x, region.y + index * edit.fontSize * 1.15));
  }
  return canvas;
}

export async function exportEditorPdf(file: File, pages: Record<number, EditorPage>, edits: EditorEdits, report: (page: number) => void): Promise<Blob> {
  const source = await PDFDocument.load(await file.arrayBuffer());
  const output = await PDFDocument.create();
  for (let i = 0; i < source.getPageCount(); i++) {
    const number = i + 1;
    report(number);
    const pageEdits = edits[number];
    if (!pageEdits || !Object.keys(pageEdits).length) {
      const [copy] = await output.copyPages(source, [i]);
      output.addPage(copy);
      continue;
    }
    const page = pages[number];
    if (!page) throw new Error(`Page ${number} is not ready. Open it before saving.`);
    const canvas = await paintEditorPage(page, pageEdits);
    const image = await output.embedPng(canvas.toDataURL("image/png"));
    const original = source.getPage(i);
    const rotation = ((original.getRotation().angle % 360) + 360) % 360;
    const box = original.getCropBox();
    const size: [number, number] = rotation === 90 || rotation === 270 ? [box.height, box.width] : [box.width, box.height];
    const target = output.addPage(size);
    target.drawImage(image, { x: 0, y: 0, width: size[0], height: size[1] });
  }
  return new Blob([await output.save() as BlobPart], { type: "application/pdf" });
}
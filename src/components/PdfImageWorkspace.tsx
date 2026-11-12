import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { pdfToImagePages } from "@/lib/pdf-tools";
import { prepareArchive } from "@/lib/batch";

type Format = "image/png" | "image/jpeg" | "image/webp";
const formats = { "image/png": "PNG", "image/jpeg": "JPG", "image/webp": "WebP" };

export function PdfImageWorkspace({ jpgOnly = false }: { jpgOnly?: boolean }) {
  const [format, setFormat] = useState<Format>(jpgOnly ? "image/jpeg" : "image/png");
  const [quality, setQuality] = useState("balanced");
  return <ToolWorkspace title={jpgOnly ? "PDF to JPG" : "PDF to Image"}
    description="Convert PDF pages to images. Download individual pages or all converted files together."
    accept="application/pdf,.pdf" multi={false} autoProcess cta="Convert PDFs"
    sidebar={<div className="space-y-5 text-sm">
      {!jpgOnly && <div><p className="mb-2 font-medium">Format</p>{(Object.keys(formats) as Format[]).map((f) => <label key={f} className="flex cursor-pointer items-center gap-2 py-2"><input type="radio" name="format" checked={format === f} onChange={() => setFormat(f)} className="accent-primary" />{formats[f]}</label>)}</div>}
      <div><p className="mb-2 font-medium">Quality</p>{[["fast", "Fast"], ["balanced", "Balanced"], ["hq", "High quality"]].map(([value, label]) => <label key={value} className="flex cursor-pointer items-center gap-2 py-2"><input type="radio" name="quality" checked={quality === value} onChange={() => setQuality(value)} className="accent-primary" />{label}</label>)}</div>
    </div>}
    process={async ([file], report) => {
      const { blobs } = await pdfToImagePages(file, {
        format, scale: quality === "fast" ? 1 : quality === "hq" ? 2.2 : 1.5,
        quality: quality === "hq" ? 0.95 : 0.85, concurrency: 2,
        onProgress: (done, total) => report(0, `Rendering page ${done}/${total}`, Math.round(done / total * 90)),
      });
      const base = file.name.replace(/\.pdf$/i, "");
      const ext = formats[format].toLowerCase();
      const images = blobs.map((blob, i) => ({ blob, filename: `${base}-page-${String(i + 1).padStart(3, "0")}.${ext}` }));
      report(0, "Packaging images", 95);
      const archive = await prepareArchive(images);
      if (!archive) throw new Error("No pages were found in this PDF.");
      return { ...archive, filename: images.length === 1 ? images[0].filename : `${base}-images.zip`, images };
    }} />;
}
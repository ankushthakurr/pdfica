import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { ocrPdfToText } from "@/lib/pdf-tools";

export const Route = createFileRoute("/tools/ocr")({
  head: () => ({ meta: [{ title: "OCR PDF — Free Online | Pdfica" }, { name: "description", content: "Extract text from scanned PDFs in your browser, free and private." },
      { property: "og:title", content: "OCR PDF — Free Online | Pdfica" },
      { property: "og:description", content: "Extract text from scanned PDFs in your browser, free and private." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ] }),
  component: () => <ToolWorkspace title="OCR PDF" description="Extract English text from scanned PDFs." accept="application/pdf,.pdf" multi={false} autoProcess cta="Run OCR"
    process={async ([file], report) => ({ blob: await ocrPdfToText(file, (pct, phase) => report(0, phase, pct)), filename: file.name.replace(/\.pdf$/i, "") + ".txt" })} />,
});

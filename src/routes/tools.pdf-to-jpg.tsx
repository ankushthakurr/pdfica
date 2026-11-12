import { createFileRoute } from "@tanstack/react-router";
import { PdfImageWorkspace } from "@/components/PdfImageWorkspace";

export const Route = createFileRoute("/tools/pdf-to-jpg")({
  head: () => ({ meta: [
    { title: "PDF to JPG — Free Batch Converter | Pdfica" },
    { name: "description", content: "Convert PDF pages into images with batch uploads, individual downloads, and ready-to-save ZIP files." },
    { property: "og:title", content: "PDF to JPG — Pdfica" },
    { property: "og:description", content: "Free private PDF image conversion with batch downloads." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <PdfImageWorkspace jpgOnly />,
});

import { createFileRoute } from "@tanstack/react-router";
import { PdfEditor } from "@/components/PdfEditor";

export const Route = createFileRoute("/tools/edit")({
  head: () => ({ meta: [{ title: "Edit PDF — Select, Rewrite & Delete Text | Pdfica" }, { name: "description", content: "Edit PDF text visually, recognize scanned pages, add or delete text, and download your edited PDF free and privately." },
      { property: "og:title", content: "Edit PDF — Select, Rewrite & Delete Text | Pdfica" },
      { property: "og:description", content: "Edit detected PDF text and scanned pages visually, then download the result. Free, private, no signup." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ] }),
  component: PdfEditor,
});

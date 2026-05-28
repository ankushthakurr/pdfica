import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { pdfToJpgs } from "@/lib/pdf-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("pdf-to-jpg")!;

export const Route = createFileRoute("/tools/pdf-to-jpg")({
  head: () => ({
    meta: [
      { title: "PDF to JPG — Export PDF Pages as Images | Pdfica" },
      { name: "description", content: "Render each PDF page as a high-quality JPG image. Single page downloads as JPG, multi-page as ZIP." },
      { property: "og:title", content: "PDF to JPG — Pdfica" },
      { property: "og:description", content: "Export every PDF page as a JPG image, free in your browser." },
    ],
  }),
  component: () => (
    <ToolWorkspace
      title={tool.name}
      description={tool.description}
      accept={tool.accept}
      multi={false}
      cta="Convert to JPG"
      process={async ([file]) => pdfToJpgs(file)}
    />
  ),
});

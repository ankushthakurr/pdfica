import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { wordToPdf } from "@/lib/pdf-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("word-to-pdf")!;

export const Route = createFileRoute("/tools/word-to-pdf")({
  head: () => ({
    meta: [
      { title: "Word to PDF — Convert DOCX to PDF Free | Pdfica" },
      { name: "description", content: "Convert .docx Word documents into clean PDFs directly in your browser." },
      { property: "og:title", content: "Word to PDF — Pdfica" },
      { property: "og:description", content: "Turn Word documents into PDFs without leaving your browser." },
    ],
  }),
  component: () => (
    <ToolWorkspace
      title={tool.name}
      description={tool.description}
      accept={tool.accept}
      multi={false}
      cta="Convert to PDF"
      process={async ([file]) => {
        const blob = await wordToPdf(file);
        return { blob, filename: file.name.replace(/\.docx$/i, "") + ".pdf" };
      }}
    />
  ),
});

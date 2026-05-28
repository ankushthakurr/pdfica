import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { pdfToWord } from "@/lib/pdf-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("pdf-to-word")!;

export const Route = createFileRoute("/tools/pdf-to-word")({
  head: () => ({
    meta: [
      { title: "PDF to Word — Convert PDF to DOCX Free | Pdfica" },
      { name: "description", content: "Convert your PDF to an editable Word (.docx) document directly in your browser. No upload required." },
      { property: "og:title", content: "PDF to Word — Pdfica" },
      { property: "og:description", content: "Extract text from PDFs into a clean editable Word document." },
    ],
  }),
  component: () => (
    <ToolWorkspace
      title={tool.name}
      description={tool.description}
      accept={tool.accept}
      multi={false}
      cta="Convert to Word"
      process={async ([file]) => {
        const blob = await pdfToWord(file);
        return { blob, filename: file.name.replace(/\.pdf$/i, "") + ".docx" };
      }}
    />
  ),
});

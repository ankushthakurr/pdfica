import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { pdfToText } from "@/lib/doc-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("pdf-to-text")!;

export const Route = createFileRoute("/tools/pdf-to-text")({
  head: () => ({ meta: [{ title: "PDF to Text — Free | Pdfica" }, { name: "description", content: "Extract all text from a PDF and download a .txt file." }] }),
  component: () => (
    <ToolWorkspace title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Extract text"
      process={async ([file]) => {
        const blob = await pdfToText(file);
        return { blob, filename: file.name.replace(/\.pdf$/i, "") + ".txt" };
      }} />
  ),
});

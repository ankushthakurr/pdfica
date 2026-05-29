import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { pdfToPdfA } from "@/lib/pdf-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("pdf-to-pdfa")!;

export const Route = createFileRoute("/tools/pdf-to-pdfa")({
  head: () => ({ meta: [{ title: "PDF to PDF/A — Free | Pdfica" }, { name: "description", content: "Re-save a PDF in an archive-friendly PDF/A best-effort format." }] }),
  component: () => (
    <ToolWorkspace title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Convert"
      process={async ([file]) => {
        const blob = await pdfToPdfA(file);
        return { blob, filename: file.name.replace(/\.pdf$/i, "") + "-pdfa.pdf" };
      }} />
  ),
});

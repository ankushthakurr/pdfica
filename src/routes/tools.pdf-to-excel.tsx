import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { pdfToExcel } from "@/lib/pdf-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("pdf-to-excel")!;

export const Route = createFileRoute("/tools/pdf-to-excel")({
  head: () => ({ meta: [{ title: "PDF to Excel — Free | Pdfica" }, { name: "description", content: "Extract PDF text content into an Excel workbook." }] }),
  component: () => (
    <ToolWorkspace title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Convert to Excel"
      process={async ([file]) => {
        const blob = await pdfToExcel(file);
        return { blob, filename: file.name.replace(/\.pdf$/i, "") + ".xlsx" };
      }} />
  ),
});

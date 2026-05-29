import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { csvToExcel } from "@/lib/doc-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("csv-to-excel")!;

export const Route = createFileRoute("/tools/csv-to-excel")({
  head: () => ({ meta: [{ title: "CSV to Excel — Free | Pdfica" }, { name: "description", content: "Convert CSV files to Excel .xlsx in your browser." }] }),
  component: () => (
    <ToolWorkspace title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Convert"
      process={async ([file]) => {
        const blob = await csvToExcel(file);
        return { blob, filename: file.name.replace(/\.csv$/i, "") + ".xlsx" };
      }} />
  ),
});

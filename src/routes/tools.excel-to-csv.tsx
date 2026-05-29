import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { excelToCsv } from "@/lib/doc-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("excel-to-csv")!;

export const Route = createFileRoute("/tools/excel-to-csv")({
  head: () => ({ meta: [{ title: "Excel to CSV — Free | Pdfica" }, { name: "description", content: "Export Excel sheets to CSV in your browser." }] }),
  component: () => (
    <ToolWorkspace title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Convert"
      process={async ([file]) => {
        const blob = await excelToCsv(file);
        return { blob, filename: file.name.replace(/\.[^.]+$/, "") + ".csv" };
      }} />
  ),
});

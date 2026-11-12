import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { csvToExcel } from "@/lib/doc-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("csv-to-excel")!;

export const Route = createFileRoute("/tools/csv-to-excel")({
  head: () => ({ meta: [{ title: "CSV to Excel — Free | Pdfica" }, { name: "description", content: "Convert CSV files to Excel .xlsx in your browser." },
      { property: "og:title", content: "CSV to Excel — Free | Pdfica" },
      { property: "og:description", content: "Convert CSV files to Excel .xlsx in your browser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ] }),
  component: () => (
    <ToolWorkspace title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Convert"
      process={async ([file]) => {
        const blob = await csvToExcel(file);
        return { blob, filename: file.name.replace(/\.csv$/i, "") + ".xlsx" };
      }} />
  ),
});

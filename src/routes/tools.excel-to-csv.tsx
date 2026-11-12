import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { excelToCsv } from "@/lib/doc-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("excel-to-csv")!;

export const Route = createFileRoute("/tools/excel-to-csv")({
  head: () => ({ meta: [{ title: "Excel to CSV — Free | Pdfica" }, { name: "description", content: "Export Excel sheets to CSV in your browser." },
      { property: "og:title", content: "Excel to CSV — Free | Pdfica" },
      { property: "og:description", content: "Export Excel sheets to CSV in your browser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ] }),
  component: () => (
    <ToolWorkspace title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Convert"
      process={async ([file]) => {
        const blob = await excelToCsv(file);
        return { blob, filename: file.name.replace(/\.[^.]+$/, "") + ".csv" };
      }} />
  ),
});

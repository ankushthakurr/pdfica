import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { excelToPdf } from "@/lib/pdf-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("excel-to-pdf")!;

export const Route = createFileRoute("/tools/excel-to-pdf")({
  head: () => ({ meta: [{ title: "Excel to PDF — Free | Pdfica" }, { name: "description", content: "Convert .xlsx spreadsheets into a PDF in your browser." },
      { property: "og:title", content: "Excel to PDF — Free | Pdfica" },
      { property: "og:description", content: "Convert .xlsx spreadsheets into a PDF in your browser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ] }),
  component: () => (
    <ToolWorkspace title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Convert to PDF"
      process={async ([file]) => {
        const blob = await excelToPdf(file);
        return { blob, filename: file.name.replace(/\.[^.]+$/, "") + ".pdf" };
      }} />
  ),
});

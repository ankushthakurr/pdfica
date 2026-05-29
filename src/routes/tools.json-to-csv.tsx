import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { jsonToCsv } from "@/lib/doc-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("json-to-csv")!;

export const Route = createFileRoute("/tools/json-to-csv")({
  head: () => ({ meta: [{ title: "JSON to CSV — Free | Pdfica" }, { name: "description", content: "Convert a JSON array to a CSV file." }] }),
  component: () => (
    <ToolWorkspace title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Convert"
      process={async ([file]) => {
        const blob = await jsonToCsv(file);
        return { blob, filename: file.name.replace(/\.json$/i, "") + ".csv" };
      }} />
  ),
});

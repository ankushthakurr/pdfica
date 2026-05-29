import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { pdfMetadata } from "@/lib/doc-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("pdf-metadata")!;

export const Route = createFileRoute("/tools/pdf-metadata")({
  head: () => ({ meta: [{ title: "PDF Metadata Viewer — Free | Pdfica" }, { name: "description", content: "Inspect PDF metadata: title, author, page count and more." }] }),
  component: () => (
    <ToolWorkspace title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Inspect"
      process={async ([file]) => {
        const blob = await pdfMetadata(file);
        return { blob, filename: file.name.replace(/\.pdf$/i, "") + "-metadata.json" };
      }} />
  ),
});

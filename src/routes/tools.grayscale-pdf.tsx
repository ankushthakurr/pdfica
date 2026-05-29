import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { grayscalePdf } from "@/lib/doc-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("grayscale-pdf")!;

export const Route = createFileRoute("/tools/grayscale-pdf")({
  head: () => ({ meta: [{ title: "Grayscale PDF — Free | Pdfica" }, { name: "description", content: "Convert every page of a PDF to black and white." }] }),
  component: () => (
    <ToolWorkspace title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Convert"
      process={async ([file]) => {
        const blob = await grayscalePdf(file);
        return { blob, filename: file.name.replace(/\.pdf$/i, "") + "-bw.pdf" };
      }} />
  ),
});

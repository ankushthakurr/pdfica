import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { repairPdf } from "@/lib/pdf-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("repair")!;

export const Route = createFileRoute("/tools/repair")({
  head: () => ({ meta: [{ title: "Repair PDF — Free Online | Pdfica" }, { name: "description", content: "Best-effort in-browser repair of slightly corrupted PDFs." }] }),
  component: () => (
    <ToolWorkspace title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Repair"
      process={async ([file]) => {
        const blob = await repairPdf(file);
        return { blob, filename: file.name.replace(/\.pdf$/i, "") + "-repaired.pdf" };
      }} />
  ),
});

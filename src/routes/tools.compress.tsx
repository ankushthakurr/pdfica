import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { compressPdf } from "@/lib/pdf-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("compress")!;

export const Route = createFileRoute("/tools/compress")({
  head: () => ({
    meta: [
      { title: "Compress PDF — Reduce File Size Free | Pdfica" },
      { name: "description", content: "Compress a PDF in your browser. Re-encodes images and strips metadata for a smaller file." },
      { property: "og:title", content: "Compress PDF — Pdfica" },
      { property: "og:description", content: "Reduce PDF file size without leaving your browser." },
    ],
  }),
  component: () => (
    <ToolWorkspace
      title={tool.name}
      description={tool.description}
      accept={tool.accept}
      multi={false}
      cta="Compress"
      process={async ([file]) => {
        const blob = await compressPdf(file);
        return { blob, filename: file.name.replace(/\.pdf$/i, "") + "-compressed.pdf" };
      }}
    />
  ),
});

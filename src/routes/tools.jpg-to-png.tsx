import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { convertImage } from "@/lib/image-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("jpg-to-png")!;

function Page() {
  return (
    <ToolWorkspace
      title={tool.name}
      description={tool.description}
      accept={tool.accept}
      multi={false}
      cta="Convert to PNG"
      process={async ([file]) => {
        const blob = await convertImage(file, "image/png");
        return { blob, filename: file.name.replace(/\.[^.]+$/, "") + ".png" };
      }}
    />
  );
}

export const Route = createFileRoute("/tools/jpg-to-png")({
  head: () => ({
    meta: [
      { title: "JPG to PNG — Free Online Converter | Pdfica" },
      { name: "description", content: "Convert JPG/JPEG images to lossless PNG in your browser. Drag and drop, instant download, completely private." },
      { property: "og:title", content: "JPG to PNG — Pdfica" },
      { property: "og:description", content: "Fast, free JPG → PNG conversion. No upload, no signup." },
    ],
  }),
  component: Page,
});

import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { convertImage } from "@/lib/image-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("png-to-jpg")!;

function Page() {
  return (
    <ToolWorkspace
      title={tool.name}
      description={tool.description}
      accept={tool.accept}
      multi={false}
      cta="Convert to JPG"
      process={async ([file]) => {
        const blob = await convertImage(file, "image/jpeg");
        return { blob, filename: file.name.replace(/\.[^.]+$/, "") + ".jpg" };
      }}
    />
  );
}

export const Route = createFileRoute("/tools/png-to-jpg")({
  head: () => ({
    meta: [
      { title: "PNG to JPG — Free Online Converter | Pdfica" },
      { name: "description", content: "Convert PNG images to JPG in your browser. Drag and drop, instant download, completely private." },
      { property: "og:title", content: "PNG to JPG — Pdfica" },
      { property: "og:description", content: "Fast, free PNG → JPG conversion. No upload, no signup." },
    ],
  }),
  component: Page,
});

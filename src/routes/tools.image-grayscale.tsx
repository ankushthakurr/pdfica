import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { grayscaleImage } from "@/lib/image-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("image-grayscale")!;

export const Route = createFileRoute("/tools/image-grayscale")({
  head: () => ({ meta: [{ title: "Grayscale Image — Free | Pdfica" }, { name: "description", content: "Convert any image to black and white in your browser." },
      { property: "og:title", content: "Grayscale Image — Free | Pdfica" },
      { property: "og:description", content: "Convert any image to black and white in your browser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ] }),
  component: () => (
    <ToolWorkspace title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Convert"
      process={async ([file]) => {
        const blob = await grayscaleImage(file);
        return { blob, filename: file.name.replace(/\.[^.]+$/, "") + "-bw." + (file.type === "image/png" ? "png" : "jpg") };
      }} />
  ),
});

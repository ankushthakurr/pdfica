import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { removeExif } from "@/lib/image-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("remove-exif")!;

export const Route = createFileRoute("/tools/remove-exif")({
  head: () => ({ meta: [{ title: "Remove EXIF Data — Free | Pdfica" }, { name: "description", content: "Strip GPS, camera and other EXIF metadata from images." }] }),
  component: () => (
    <ToolWorkspace title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Strip metadata"
      process={async ([file]) => {
        const blob = await removeExif(file);
        return { blob, filename: file.name.replace(/\.[^.]+$/, "") + "-clean." + (file.type === "image/png" ? "png" : "jpg") };
      }} />
  ),
});

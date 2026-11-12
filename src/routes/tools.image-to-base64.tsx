import { createFileRoute } from "@tanstack/react-router";
import { ToolWorkspace } from "@/components/ToolWorkspace";

function Page() {
  return <ToolWorkspace title="Image to Base64" description="Convert images into downloadable Base64 data URIs." accept="image/*" multi={false} autoProcess cta="Convert"
    process={async ([file]) => {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Image could not be read."));
        reader.onerror = () => reject(new Error("Image could not be read."));
        reader.readAsDataURL(file);
      });
      return { blob: new Blob([data], { type: "text/plain" }), filename: file.name + "-base64.txt" };
    }} />;
}

export const Route = createFileRoute("/tools/image-to-base64")({
  head: () => ({ meta: [{ title: "Image to Base64 — Free | Pdfica" }, { name: "description", content: "Convert any image to a Base64 data URI in your browser." },
      { property: "og:title", content: "Image to Base64 — Free | Pdfica" },
      { property: "og:description", content: "Convert any image to a Base64 data URI in your browser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ] }),
  component: Page,
});

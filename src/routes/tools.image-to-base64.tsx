import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";
import { Copy, UploadCloud } from "lucide-react";

function Page() {
  const [dataUri, setDataUri] = useState("");
  const [name, setName] = useState("");
  const onFile = (f: File) => {
    setName(f.name);
    const r = new FileReader();
    r.onload = () => setDataUri(r.result as string);
    r.readAsDataURL(f);
  };
  return (
    <UtilityPage title="Image to Base64" description="Convert images to a Base64 data URI for inlining in HTML, CSS or JSON.">
      <label className="block cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center hover:border-primary transition-colors">
        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        <UploadCloud className="mx-auto h-8 w-8 text-primary" />
        <p className="mt-2 text-sm font-semibold">Drop an image or click to browse</p>
        {name && <p className="mt-1 text-xs text-muted-foreground">{name}</p>}
      </label>
      {dataUri && (
        <>
          <div className="mt-6 flex flex-col items-center gap-3">
            <img src={dataUri} alt="preview" className="max-h-48 rounded-lg border" />
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Data URI ({Math.round(dataUri.length / 1024)} KB)</span>
              <button onClick={() => navigator.clipboard.writeText(dataUri)} className="inline-flex items-center gap-1 rounded-md border bg-surface px-2 py-1 text-xs hover:bg-muted">
                <Copy className="h-3 w-3" /> Copy
              </button>
            </div>
            <textarea readOnly value={dataUri} rows={6} className="w-full rounded-lg border bg-muted/40 p-3 font-mono text-xs" />
          </div>
        </>
      )}
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/image-to-base64")({
  head: () => ({ meta: [{ title: "Image to Base64 — Free | Pdfica" }, { name: "description", content: "Convert any image to a Base64 data URI in your browser." }] }),
  component: Page,
});

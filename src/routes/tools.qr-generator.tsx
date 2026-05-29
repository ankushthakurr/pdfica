import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";
import { generateQrCode } from "@/lib/doc-tools";
import { downloadBlob } from "@/lib/format";
import { Download, AlertTriangle, Loader2 } from "lucide-react";

function Page() {
  const [text, setText] = useState("https://pdfica.in");
  const [url, setUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true); setError(null);
    try {
      const b = await generateQrCode(text);
      setBlob(b);
      setUrl(URL.createObjectURL(b));
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };
  return (
    <UtilityPage title="QR Code Generator" description="Generate a high-resolution PNG QR code for any link or text.">
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="URL or text"
        className="w-full rounded-lg border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 mt-0.5" /><span>{error}</span>
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <button onClick={run} disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50 hover:scale-[1.03] transition-transform">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Generate
        </button>
      </div>
      {url && blob && (
        <div className="mt-8 flex flex-col items-center gap-4">
          <img src={url} alt="QR code" className="h-64 w-64 rounded-2xl border bg-white p-4" />
          <button onClick={() => downloadBlob(blob, "qr-code.png")}
            className="inline-flex items-center gap-2 rounded-full border bg-surface px-6 py-3 text-sm font-semibold hover:bg-muted">
            <Download className="h-4 w-4" /> Download PNG
          </button>
        </div>
      )}
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/qr-generator")({
  head: () => ({ meta: [{ title: "QR Code Generator — Free | Pdfica" }, { name: "description", content: "Generate QR codes for any URL or text." }] }),
  component: Page,
});

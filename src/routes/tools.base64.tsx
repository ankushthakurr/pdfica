import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";
import { encodeBase64, decodeBase64 } from "@/lib/doc-tools";
import { AlertTriangle } from "lucide-react";

function Page() {
  const [text, setText] = useState("Hello Pdfica");
  const [error, setError] = useState<string | null>(null);
  const enc = () => { try { setText(encodeBase64(text)); setError(null); } catch (e) { setError((e as Error).message); } };
  const dec = () => { try { setText(decodeBase64(text)); setError(null); } catch (e) { setError((e as Error).message); } };
  return (
    <UtilityPage title="Base64 Encode / Decode" description="Encode any text to Base64 or decode a Base64 string.">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={12}
        className="w-full rounded-lg border bg-background p-3 font-mono text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 mt-0.5" /><span>{error}</span>
        </div>
      )}
      <div className="mt-4 flex justify-end gap-3">
        <button onClick={dec} className="rounded-full border bg-surface px-5 py-2.5 text-sm font-semibold hover:bg-muted">Decode</button>
        <button onClick={enc} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:scale-[1.03] transition-transform">Encode</button>
      </div>
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/base64")({
  head: () => ({ meta: [{ title: "Base64 Encode/Decode — Free | Pdfica" }, { name: "description", content: "Encode and decode Base64 strings in your browser." }] }),
  component: Page,
});

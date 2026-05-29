import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";
import { formatJson } from "@/lib/doc-tools";
import { AlertTriangle } from "lucide-react";

function Page() {
  const [text, setText] = useState('{"hello": "world"}');
  const [error, setError] = useState<string | null>(null);
  const format = () => {
    try { setText(formatJson(text)); setError(null); }
    catch (e) { setError((e as Error).message); }
  };
  const minify = () => {
    try { setText(JSON.stringify(JSON.parse(text))); setError(null); }
    catch (e) { setError((e as Error).message); }
  };
  return (
    <UtilityPage title="JSON Formatter" description="Pretty-print or minify any JSON.">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={16}
        className="w-full rounded-lg border bg-background p-3 font-mono text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 mt-0.5" /><span>{error}</span>
        </div>
      )}
      <div className="mt-4 flex justify-end gap-3">
        <button onClick={minify} className="rounded-full border bg-surface px-5 py-2.5 text-sm font-semibold hover:bg-muted">Minify</button>
        <button onClick={format} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:scale-[1.03] transition-transform">Pretty print</button>
      </div>
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/json-formatter")({
  head: () => ({ meta: [{ title: "JSON Formatter — Free | Pdfica" }, { name: "description", content: "Format and minify JSON in your browser." }] }),
  component: Page,
});

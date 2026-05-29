import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";
import { hashText } from "@/lib/doc-tools";
import { Copy } from "lucide-react";

const ALGOS = ["SHA-1", "SHA-256", "SHA-512"] as const;

function Page() {
  const [text, setText] = useState("Hello Pdfica");
  const [results, setResults] = useState<Record<string, string>>({});
  const run = async () => {
    const out: Record<string, string> = {};
    for (const a of ALGOS) out[a] = await hashText(text, a);
    setResults(out);
  };
  return (
    <UtilityPage title="Hash Generator" description="Compute SHA-1, SHA-256 and SHA-512 hashes locally.">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6}
        className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
      <div className="mt-4 flex justify-end">
        <button onClick={run} className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:scale-[1.03] transition-transform">
          Hash
        </button>
      </div>
      <div className="mt-6 space-y-3">
        {ALGOS.map((a) => (
          <div key={a} className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">{a}</p>
              {results[a] && (
                <button onClick={() => navigator.clipboard.writeText(results[a])}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary">
                  <Copy className="h-3 w-3" /> Copy
                </button>
              )}
            </div>
            <p className="mt-2 break-all font-mono text-sm">{results[a] ?? "—"}</p>
          </div>
        ))}
      </div>
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/hash-generator")({
  head: () => ({ meta: [{ title: "Hash Generator — Free | Pdfica" }, { name: "description", content: "Compute SHA-1, SHA-256 and SHA-512 hashes in your browser." }] }),
  component: Page,
});

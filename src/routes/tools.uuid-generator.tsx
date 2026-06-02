import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";
import { Copy, RefreshCw } from "lucide-react";

function Page() {
  const [n, setN] = useState(5);
  const [list, setList] = useState<string[]>([]);
  const gen = () => setList(Array.from({ length: n }, () => crypto.randomUUID()));
  return (
    <UtilityPage title="UUID Generator (v4)" description="Generate one or many cryptographically random v4 UUIDs.">
      <div className="flex items-center gap-3">
        <label className="text-sm">Count: <input type="number" min={1} max={500} value={n} onChange={(e) => setN(+e.target.value)} className="ml-2 w-24 rounded-lg border bg-background px-2 py-1" /></label>
        <button onClick={gen} className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-glow hover:scale-[1.03] transition-transform"><RefreshCw className="h-4 w-4" /> Generate</button>
        {list.length > 0 && <button onClick={() => navigator.clipboard.writeText(list.join("\n"))} className="inline-flex items-center gap-2 rounded-lg border bg-surface px-3 py-2 text-sm hover:bg-muted"><Copy className="h-4 w-4" /> Copy all</button>}
      </div>
      {list.length > 0 && (
        <pre className="mt-4 rounded-2xl border bg-muted/40 p-4 text-sm font-mono overflow-auto">{list.join("\n")}</pre>
      )}
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/uuid-generator")({
  head: () => ({ meta: [{ title: "UUID Generator — Free Online | Pdfica" }, { name: "description", content: "Generate v4 UUIDs in your browser. Bulk-generate any number." }] }),
  component: Page,
});

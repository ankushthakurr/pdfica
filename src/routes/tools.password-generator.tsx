import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";
import { generatePassword } from "@/lib/doc-tools";
import { Copy, RefreshCw, AlertTriangle } from "lucide-react";

function Page() {
  const [length, setLength] = useState(20);
  const [opts, setOpts] = useState({ upper: true, lower: true, digits: true, symbols: true });
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const gen = () => {
    try { setValue(generatePassword(length, opts)); setError(null); }
    catch (e) { setError((e as Error).message); }
  };
  return (
    <UtilityPage title="Password Generator" description="Cryptographically random passwords with custom rules.">
      <div className="flex gap-2">
        <input readOnly value={value} placeholder="Click Generate to create a password"
          className="flex-1 rounded-lg border bg-background px-4 py-3 font-mono outline-none" />
        <button onClick={() => navigator.clipboard.writeText(value)} disabled={!value}
          className="inline-flex items-center gap-2 rounded-lg border bg-surface px-4 py-3 text-sm font-semibold hover:bg-muted disabled:opacity-50">
          <Copy className="h-4 w-4" /> Copy
        </button>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block text-sm"><span className="font-medium">Length: {length}</span>
          <input type="range" min={6} max={64} value={length} onChange={(e) => setLength(+e.target.value)} className="mt-1 w-full accent-primary" />
        </label>
        <div className="space-y-2 text-sm">
          {(["upper", "lower", "digits", "symbols"] as const).map((k) => (
            <label key={k} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={opts[k]} onChange={(e) => setOpts({ ...opts, [k]: e.target.checked })} className="accent-primary" />
              <span className="capitalize">{k}</span>
            </label>
          ))}
        </div>
      </div>
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 mt-0.5" /><span>{error}</span>
        </div>
      )}
      <div className="mt-5 flex justify-end">
        <button onClick={gen} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:scale-[1.03] transition-transform">
          <RefreshCw className="h-4 w-4" /> Generate
        </button>
      </div>
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/password-generator")({
  head: () => ({ meta: [{ title: "Password Generator — Free | Pdfica" }, { name: "description", content: "Generate strong, random passwords in your browser." }] }),
  component: Page,
});

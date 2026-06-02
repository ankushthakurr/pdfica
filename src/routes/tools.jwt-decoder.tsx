import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";

function b64url(s: string) { try { return JSON.parse(atob(s.replace(/-/g, "+").replace(/_/g, "/"))); } catch { return null; } }

function Page() {
  const [tok, setTok] = useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0IiwibmFtZSI6IkphbmUgRG9lIiwiaWF0IjoxNzAwMDAwMDAwfQ.signature");
  const parts = useMemo(() => {
    const [h, p] = tok.split(".");
    return { header: h ? b64url(h) : null, payload: p ? b64url(p) : null };
  }, [tok]);
  const fld = "w-full rounded-lg border bg-background p-3 text-sm font-mono outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
  return (
    <UtilityPage title="JWT Decoder" description="Decode and inspect any JSON Web Token. Tokens never leave your browser.">
      <textarea rows={4} className={fld} value={tok} onChange={(e) => setTok(e.target.value)} placeholder="Paste a JWT…" />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold mb-1">Header</p>
          <pre className="rounded-2xl border bg-muted/40 p-3 text-xs overflow-auto">{parts.header ? JSON.stringify(parts.header, null, 2) : "—"}</pre>
        </div>
        <div>
          <p className="text-sm font-semibold mb-1">Payload</p>
          <pre className="rounded-2xl border bg-muted/40 p-3 text-xs overflow-auto">{parts.payload ? JSON.stringify(parts.payload, null, 2) : "—"}</pre>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">This tool only decodes — it does not verify the signature.</p>
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/jwt-decoder")({
  head: () => ({ meta: [{ title: "JWT Decoder — Free | Pdfica" }, { name: "description", content: "Decode JSON Web Tokens (JWT) in your browser. Header and payload, fully private." }] }),
  component: Page,
});

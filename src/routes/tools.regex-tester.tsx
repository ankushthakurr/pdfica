import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";

function Page() {
  const [pat, setPat] = useState("\\b\\w+@\\w+\\.\\w+\\b");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("Email me at jane@example.com or john@acme.co.");

  const { error, matches, highlighted } = useMemo(() => {
    try {
      const re = new RegExp(pat, flags);
      const m = Array.from(text.matchAll(flags.includes("g") ? re : new RegExp(pat, flags + "g")));
      let last = 0; const parts: (string | JSX.Element)[] = [];
      m.forEach((mm, i) => {
        const s = mm.index ?? 0;
        parts.push(text.slice(last, s));
        parts.push(<mark key={i} className="bg-primary/30 rounded px-0.5">{mm[0]}</mark>);
        last = s + mm[0].length;
      });
      parts.push(text.slice(last));
      return { error: null as string | null, matches: m.map((x) => x[0]), highlighted: parts };
    } catch (e) {
      return { error: (e as Error).message, matches: [] as string[], highlighted: [text] as (string | JSX.Element)[] };
    }
  }, [pat, flags, text]);

  const fld = "rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
  return (
    <UtilityPage title="Regex Tester" description="Test JavaScript regular expressions live with match highlighting.">
      <div className="flex gap-2">
        <span className="text-muted-foreground py-2">/</span>
        <input className={fld + " flex-1 font-mono"} value={pat} onChange={(e) => setPat(e.target.value)} />
        <span className="text-muted-foreground py-2">/</span>
        <input className={fld + " w-24 font-mono"} value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="gim" />
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <textarea rows={6} className={fld + " w-full mt-3"} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="mt-4 rounded-2xl border bg-muted/40 p-4 text-sm whitespace-pre-wrap break-words">{highlighted}</div>
      <p className="mt-3 text-xs text-muted-foreground">{matches.length} match{matches.length !== 1 ? "es" : ""}</p>
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/regex-tester")({
  head: () => ({ meta: [{ title: "Regex Tester — Free Online | Pdfica" }, { name: "description", content: "Test JavaScript regex patterns live with match highlighting. Free and private." }] }),
  component: Page,
});

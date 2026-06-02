import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";
import { Sparkles, Copy } from "lucide-react";

function summarize(text: string, count: number): string {
  const sents = text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+/g) || [text];
  if (sents.length <= count) return sents.join(" ").trim();
  const stop = new Set("a an the and or but of in on at to for with by is are was were be been being have has had do does did this that these those it its as from i you he she we they".split(" "));
  const freq: Record<string, number> = {};
  for (const w of text.toLowerCase().match(/[a-z']+/g) || []) if (!stop.has(w) && w.length > 2) freq[w] = (freq[w] || 0) + 1;
  const scored = sents.map((s, i) => {
    const words = s.toLowerCase().match(/[a-z']+/g) || [];
    const score = words.reduce((a, w) => a + (freq[w] || 0), 0) / Math.max(words.length, 1);
    return { s: s.trim(), i, score };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, count).sort((a, b) => a.i - b.i).map((x) => x.s).join(" ");
}

function Page() {
  const [text, setText] = useState("");
  const [n, setN] = useState(3);
  const summary = useMemo(() => (text.trim() ? summarize(text, n) : ""), [text, n]);
  return (
    <UtilityPage title="AI Text Summarizer" description="Paste any article — get the key sentences in seconds. 100% private, runs in your browser.">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} placeholder="Paste an article, essay or report…"
        className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
      <label className="mt-4 block text-sm"><span className="font-medium">Summary length: {n} sentence{n > 1 ? "s" : ""}</span>
        <input type="range" min={1} max={10} value={n} onChange={(e) => setN(+e.target.value)} className="mt-1 w-full accent-primary" />
      </label>
      {summary && (
        <div className="mt-6 rounded-2xl border bg-muted/40 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-primary" /> Summary</div>
            <button onClick={() => navigator.clipboard.writeText(summary)} className="inline-flex items-center gap-1 rounded-md border bg-surface px-2 py-1 text-xs hover:bg-muted">
              <Copy className="h-3 w-3" /> Copy
            </button>
          </div>
          <p className="text-sm leading-relaxed">{summary}</p>
        </div>
      )}
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/ai-summarizer")({
  head: () => ({ meta: [{ title: "AI Text Summarizer — Free Online | Pdfica" }, { name: "description", content: "Free AI text summarizer. Paste any article and get a concise summary instantly in your browser." }] }),
  component: Page,
});

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";
import { analyzeText } from "@/lib/doc-tools";

function Page() {
  const [text, setText] = useState("");
  const stats = analyzeText(text);
  const items: [string, number | string][] = [
    ["Words", stats.words],
    ["Characters", stats.chars],
    ["Characters (no spaces)", stats.charsNoSpaces],
    ["Sentences", stats.sentences],
    ["Paragraphs", stats.paragraphs],
    ["Reading time", `${stats.readingMinutes} min`],
  ];
  return (
    <UtilityPage title="Word Counter" description="Live word, character, sentence and reading-time stats.">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} placeholder="Paste or type your text here…"
        className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map(([k, v]) => (
          <div key={k} className="rounded-2xl border bg-muted/40 p-4 text-center">
            <p className="text-2xl font-display font-bold text-primary">{v}</p>
            <p className="text-xs text-muted-foreground mt-1">{k}</p>
          </div>
        ))}
      </div>
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/word-counter")({
  head: () => ({ meta: [{ title: "Word Counter — Free | Pdfica" }, { name: "description", content: "Count words, characters, sentences and reading time." }] }),
  component: Page,
});

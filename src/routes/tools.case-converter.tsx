import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";
import { convertCase, type CaseKind } from "@/lib/doc-tools";

const KINDS: { id: CaseKind; label: string }[] = [
  { id: "upper", label: "UPPERCASE" },
  { id: "lower", label: "lowercase" },
  { id: "title", label: "Title Case" },
  { id: "sentence", label: "Sentence case" },
  { id: "snake", label: "snake_case" },
  { id: "kebab", label: "kebab-case" },
  { id: "camel", label: "camelCase" },
];

function Page() {
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog.");
  return (
    <UtilityPage title="Case Converter" description="Switch text between popular casing styles.">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10}
        className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
      <div className="mt-5 flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button key={k.id} onClick={() => setText(convertCase(text, k.id))}
            className="rounded-full border bg-surface px-4 py-2 text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors">
            {k.label}
          </button>
        ))}
      </div>
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/case-converter")({
  head: () => ({ meta: [{ title: "Case Converter — Free | Pdfica" }, { name: "description", content: "Convert text between UPPER, lower, Title, snake_case and more." }] }),
  component: Page,
});

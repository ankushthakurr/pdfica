import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";
import { loremIpsum } from "@/lib/doc-tools";
import { Copy } from "lucide-react";

function Page() {
  const [count, setCount] = useState(3);
  const [value, setValue] = useState(loremIpsum(3));
  const regen = (n: number) => { setCount(n); setValue(loremIpsum(n)); };
  return (
    <UtilityPage title="Lorem Ipsum Generator" description="Generate placeholder paragraphs for your designs.">
      <label className="block text-sm mb-3"><span className="font-medium">Paragraphs: {count}</span>
        <input type="range" min={1} max={20} value={count} onChange={(e) => regen(+e.target.value)} className="mt-1 w-full accent-primary" />
      </label>
      <textarea readOnly value={value} rows={14}
        className="w-full rounded-lg border bg-background p-3 text-sm outline-none" />
      <div className="mt-4 flex justify-end">
        <button onClick={() => navigator.clipboard.writeText(value)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:scale-[1.03] transition-transform">
          <Copy className="h-4 w-4" /> Copy
        </button>
      </div>
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/lorem-ipsum")({
  head: () => ({ meta: [{ title: "Lorem Ipsum Generator — Free | Pdfica" }, { name: "description", content: "Generate Lorem Ipsum placeholder text." }] }),
  component: Page,
});

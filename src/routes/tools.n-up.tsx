import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { nUpPdf } from "@/lib/doc-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("n-up")!;

function Page() {
  const [per, setPer] = useState<2 | 4>(2);
  return (
    <ToolWorkspace title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Build"
      sidebar={
        <div className="space-y-2 text-sm">
          <span className="font-medium block">Pages per sheet</span>
          {([2, 4] as const).map((n) => (
            <label key={n} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={per === n} onChange={() => setPer(n)} className="accent-primary" />
              <span>{n}-up</span>
            </label>
          ))}
        </div>
      }
      process={async ([file]) => {
        const blob = await nUpPdf(file, per);
        return { blob, filename: file.name.replace(/\.pdf$/i, "") + `-${per}up.pdf` };
      }} />
  );
}

export const Route = createFileRoute("/tools/n-up")({
  head: () => ({ meta: [{ title: "N-up PDF — Free | Pdfica" }, { name: "description", content: "Place 2 or 4 source pages on every A4 sheet." }] }),
  component: Page,
});

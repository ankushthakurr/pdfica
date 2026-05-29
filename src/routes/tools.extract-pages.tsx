import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { extractPages } from "@/lib/pdf-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("extract-pages")!;

function Page() {
  const [ranges, setRanges] = useState("");
  return (
    <ToolWorkspace
      title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Extract"
      sidebar={
        <label className="block text-sm">
          <span className="font-medium">Pages to extract</span>
          <input value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="e.g. 1-3,5,7-9"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </label>
      }
      process={async ([file]) => {
        const blob = await extractPages(file, ranges);
        return { blob, filename: file.name.replace(/\.pdf$/i, "") + "-extracted.pdf" };
      }}
    />
  );
}

export const Route = createFileRoute("/tools/extract-pages")({
  head: () => ({ meta: [{ title: "Extract PDF Pages — Free | Pdfica" }, { name: "description", content: "Extract specific pages from a PDF in your browser." }] }),
  component: Page,
});

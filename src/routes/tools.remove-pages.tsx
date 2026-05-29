import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { removePages } from "@/lib/pdf-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("remove-pages")!;

function Page() {
  const [ranges, setRanges] = useState("");
  return (
    <ToolWorkspace
      title={tool.name} description={tool.description} accept={tool.accept} multi={false} cta="Remove"
      sidebar={
        <label className="block text-sm">
          <span className="font-medium">Pages to remove</span>
          <input value={ranges} onChange={(e) => setRanges(e.target.value)} placeholder="e.g. 2,4-5"
            className="mt-1 w-full rounded-lg border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
        </label>
      }
      process={async ([file]) => {
        const blob = await removePages(file, ranges);
        return { blob, filename: file.name.replace(/\.pdf$/i, "") + "-trimmed.pdf" };
      }}
    />
  );
}

export const Route = createFileRoute("/tools/remove-pages")({
  head: () => ({ meta: [{ title: "Remove PDF Pages — Free | Pdfica" }, { name: "description", content: "Delete pages from a PDF in your browser." }] }),
  component: Page,
});

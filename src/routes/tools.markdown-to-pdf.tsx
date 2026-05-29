import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";
import { markdownToPdfBlob } from "@/lib/doc-tools";
import { downloadBlob } from "@/lib/format";
import { Download, Loader2 } from "lucide-react";

function Page() {
  const [md, setMd] = useState("# Hello Pdfica\n\nWrite **Markdown** here.\n\n- Lists\n- Headings\n- Paragraphs");
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try {
      const blob = await markdownToPdfBlob(md);
      downloadBlob(blob, "document.pdf");
    } finally { setBusy(false); }
  };
  return (
    <UtilityPage title="Markdown to PDF" description="Render Markdown to a PDF with headings, lists and paragraphs.">
      <textarea value={md} onChange={(e) => setMd(e.target.value)} rows={16}
        className="w-full rounded-lg border bg-background p-3 font-mono text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
      <div className="mt-4 flex justify-end">
        <button onClick={run} disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-50 hover:scale-[1.03] transition-transform">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {busy ? "Generating…" : "Download PDF"}
        </button>
      </div>
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/markdown-to-pdf")({
  head: () => ({ meta: [{ title: "Markdown to PDF — Free | Pdfica" }, { name: "description", content: "Convert Markdown to PDF in your browser." }] }),
  component: Page,
});

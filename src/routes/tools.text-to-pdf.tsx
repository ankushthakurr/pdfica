import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";
import { textToPdfBlob } from "@/lib/doc-tools";
import { downloadBlob } from "@/lib/format";
import { Download } from "lucide-react";

function Page() {
  const [text, setText] = useState("Write your text here…");
  return (
    <UtilityPage title="Text to PDF" description="Paste any plain text and download it as a PDF.">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={14}
        className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
      <div className="mt-4 flex justify-end">
        <button onClick={() => downloadBlob(textToPdfBlob(text), "document.pdf")}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:scale-[1.03] transition-transform">
          <Download className="h-4 w-4" /> Download PDF
        </button>
      </div>
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/text-to-pdf")({
  head: () => ({ meta: [{ title: "Text to PDF — Free | Pdfica" }, { name: "description", content: "Convert plain text to PDF in your browser." }] }),
  component: Page,
});

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { unlockPdf } from "@/lib/pdf-tools";
import { getTool } from "@/lib/tools";

const tool = getTool("unlock")!;

function UnlockPage() {
  const [password, setPassword] = useState("");
  return (
    <ToolWorkspace
      title={tool.name}
      description={tool.description}
      accept={tool.accept}
      multi={false}
      cta="Unlock PDF"
      sidebar={
        <div className="space-y-3 text-sm">
          <label className="block">
            <span className="font-medium">Password (optional)</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <p className="text-xs text-muted-foreground">
            Only attempt to unlock PDFs you own. Files with strong encryption may not unlock fully in-browser.
          </p>
        </div>
      }
      process={async ([file]) => {
        const blob = await unlockPdf(file, password);
        return { blob, filename: file.name.replace(/\.pdf$/i, "") + "-unlocked.pdf" };
      }}
    />
  );
}

export const Route = createFileRoute("/tools/unlock")({
  head: () => ({
    meta: [
      { title: "Unlock PDF — Remove PDF Password Free | Pdfica" },
      { name: "description", content: "Remove password protection from PDFs you own, directly in your browser. Nothing is uploaded." },
      { property: "og:title", content: "Unlock PDF — Pdfica" },
      { property: "og:description", content: "Remove the password from a PDF you own. 100% private." },
    ],
  }),
  component: UnlockPage,
});

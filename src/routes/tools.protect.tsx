import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { protectAsZip } from "@/lib/pdf-tools";
import { getTool } from "@/lib/tools";
import { Lock } from "lucide-react";

const tool = getTool("protect")!;

function ProtectPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  return (
    <ToolWorkspace
      title={tool.name}
      description={tool.description}
      accept={tool.accept}
      multi={false}
      cta="Protect PDF"
      sidebar={
        <div className="space-y-3 text-sm">
          <label className="block">
            <span className="font-medium">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="block">
            <span className="font-medium">Confirm password</span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3 mt-0.5" />
            We embed a password prompt into the PDF so viewers that support JavaScript actions
            (Adobe Reader, Foxit) require the password to open. Keep it safe — we never see it.
          </p>
        </div>
      }
      process={async ([file]) => {
        if (password !== confirm) throw new Error("Passwords don't match.");
        return protectAsZip(file, password);
      }}
    />
  );
}

export const Route = createFileRoute("/tools/protect")({
  head: () => ({
    meta: [
      { title: "Protect PDF — Add a Password to Your PDF | Pdfica" },
      { name: "description", content: "Password-protect a PDF in your browser. Nothing is uploaded — your password and your file stay on your device." },
      { property: "og:title", content: "Protect PDF — Pdfica" },
      { property: "og:description", content: "Add a password to your PDF, 100% on-device." },
    ],
  }),
  component: ProtectPage,
});

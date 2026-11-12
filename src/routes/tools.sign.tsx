import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import SignaturePad from "signature_pad";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { Button } from "@/components/ui/button";
import { signPdf } from "@/lib/pdf-tools";
import { Eraser } from "lucide-react";

function Page() {
  const [page, setPage] = useState(1);
  const [position, setPosition] = useState<"bottom-right" | "bottom-left" | "bottom-center">("bottom-right");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pad = new SignaturePad(canvas, { penColor: getComputedStyle(canvas).color });
    padRef.current = pad;
    const resize = () => {
      const strokes = pad.toData();
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);
      pad.clear();
      pad.fromData(strokes);
    };
    resize(); window.addEventListener("resize", resize);
    return () => { pad.off(); padRef.current = null; window.removeEventListener("resize", resize); };
  }, []);
  return <ToolWorkspace title="Sign PDF" description="Draw your signature and apply it to your selected PDFs." accept="application/pdf,.pdf" multi={false} autoProcess={false} cta="Sign PDFs"
    sidebar={<div className="space-y-4 text-sm">
      <div><div className="mb-2 flex items-center justify-between"><span className="font-medium">Signature</span><Button size="icon" variant="ghost" title="Clear signature" aria-label="Clear signature" onClick={() => padRef.current?.clear()}><Eraser /></Button></div><canvas ref={canvasRef} className="h-40 w-full touch-none rounded-lg border bg-background text-foreground" /></div>
      <label className="block">Page #<input type="number" min={1} value={page} onChange={(e) => setPage(Number(e.target.value))} className="mt-1 w-full rounded-md border bg-background px-3 py-2" /></label>
      <div><span className="font-medium">Position</span>{(["bottom-left", "bottom-center", "bottom-right"] as const).map((value) => <label key={value} className="flex items-center gap-2 py-2"><input type="radio" name="position" checked={position === value} onChange={() => setPosition(value)} />{value.replaceAll("-", " ")}</label>)}</div>
    </div>}
    process={async ([file]) => {
      const pad = padRef.current;
      if (!pad || pad.isEmpty()) throw new Error("Draw a signature first.");
      return { blob: await signPdf(file, pad.toDataURL("image/png"), page, position), filename: file.name.replace(/\.pdf$/i, "") + "-signed.pdf" };
    }} />;
}

export const Route = createFileRoute("/tools/sign")({
  head: () => ({ meta: [{ title: "Sign PDF — Free Online | Pdfica" }, { name: "description", content: "Draw a signature and place it on any PDF page — 100% private." },
      { property: "og:title", content: "Sign PDF — Free Online | Pdfica" },
      { property: "og:description", content: "Draw a signature and place it on any PDF page — 100% private." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ] }),
  component: Page,
});

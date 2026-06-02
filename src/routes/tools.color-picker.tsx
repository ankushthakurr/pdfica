import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";
import { Copy, UploadCloud } from "lucide-react";

function rgbToHex(r: number, g: number, b: number) { return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join(""); }
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function Page() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState({ hex: "", rgb: "", hsl: "" });
  const [src, setSrc] = useState<string | null>(null);

  const load = (f: File) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const c = ref.current!; const max = 700;
        const ratio = Math.min(max / img.width, max / img.height, 1);
        c.width = img.width * ratio; c.height = img.height * ratio;
        c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
        setSrc(r.result as string);
      };
      img.src = r.result as string;
    };
    r.readAsDataURL(f);
  };
  const pick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = ref.current!; const rect = c.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * c.width;
    const y = ((e.clientY - rect.top) / rect.height) * c.height;
    const [r, g, b] = c.getContext("2d")!.getImageData(x, y, 1, 1).data;
    setColor({ hex: rgbToHex(r, g, b), rgb: `rgb(${r}, ${g}, ${b})`, hsl: rgbToHsl(r, g, b) });
  };
  return (
    <UtilityPage title="Color Picker from Image" description="Click any pixel on your image to copy its HEX, RGB or HSL value.">
      {!src && (
        <label className="block cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center hover:border-primary transition-colors">
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && load(e.target.files[0])} />
          <UploadCloud className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-2 text-sm font-semibold">Drop an image or click to browse</p>
        </label>
      )}
      <canvas ref={ref} onClick={pick} className={`mt-4 max-w-full cursor-crosshair rounded-xl border ${src ? "block" : "hidden"}`} />
      {color.hex && (
        <div className="mt-4 grid gap-3 md:grid-cols-[80px_1fr] items-center">
          <div className="h-20 w-20 rounded-2xl border-4 border-white shadow" style={{ background: color.hex }} />
          <div className="space-y-1">
            {([["HEX", color.hex], ["RGB", color.rgb], ["HSL", color.hsl]] as const).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2"><span className="w-12 text-xs text-muted-foreground">{k}</span><code className="flex-1 rounded bg-muted px-2 py-1 text-sm">{v}</code>
                <button onClick={() => navigator.clipboard.writeText(v)} className="rounded p-1 hover:bg-muted"><Copy className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/color-picker")({
  head: () => ({ meta: [{ title: "Color Picker from Image — Free | Pdfica" }, { name: "description", content: "Pick HEX, RGB, and HSL colors from any image. Free and private in your browser." }] }),
  component: Page,
});

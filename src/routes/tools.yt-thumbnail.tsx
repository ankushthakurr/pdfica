import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";
import { Download, AlertTriangle } from "lucide-react";

function parseId(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1).split("/")[0] || null;
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const m = u.pathname.match(/\/(?:embed|shorts|v)\/([^/?#]+)/);
    return m ? m[1] : null;
  } catch { return null; }
}

const RES = [
  { key: "maxresdefault", label: "Max (1280×720)" },
  { key: "sddefault", label: "Standard (640×480)" },
  { key: "hqdefault", label: "High (480×360)" },
  { key: "mqdefault", label: "Medium (320×180)" },
];

function Page() {
  const [url, setUrl] = useState("");
  const id = parseId(url);
  const download = async (key: string) => {
    if (!id) return;
    const src = `https://img.youtube.com/vi/${id}/${key}.jpg`;
    const res = await fetch(src);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${id}-${key}.jpg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  return (
    <UtilityPage title="YouTube Thumbnail Downloader" description="Paste any YouTube URL and download the thumbnail in your chosen resolution.">
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..."
        className="w-full rounded-lg border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
      {url && !id && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 mt-0.5" /><span>Not a valid YouTube URL.</span>
        </div>
      )}
      {id && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {RES.map((r) => (
            <div key={r.key} className="rounded-2xl border bg-surface p-3">
              <img src={`https://img.youtube.com/vi/${id}/${r.key}.jpg`} alt={r.label} className="w-full rounded-lg" loading="lazy"
                onError={(e) => ((e.currentTarget.parentElement as HTMLElement).style.display = "none")} />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-medium">{r.label}</span>
                <button onClick={() => download(r.key)} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                  <Download className="h-3 w-3" /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/yt-thumbnail")({
  head: () => ({ meta: [{ title: "YouTube Thumbnail Downloader — Free | Pdfica" }, { name: "description", content: "Download YouTube video thumbnails in HD, SD or HQ resolutions, free." }] }),
  component: Page,
});

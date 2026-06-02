import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";
import { Copy } from "lucide-react";

function Page() {
  const [d, setD] = useState({
    title: "My awesome page",
    description: "A short description that will appear in search results and social previews.",
    url: "https://example.com",
    image: "https://example.com/og.jpg",
    site: "@yourhandle",
  });
  const tags = `<title>${d.title}</title>
<meta name="description" content="${d.description}" />
<link rel="canonical" href="${d.url}" />

<meta property="og:type" content="website" />
<meta property="og:title" content="${d.title}" />
<meta property="og:description" content="${d.description}" />
<meta property="og:url" content="${d.url}" />
<meta property="og:image" content="${d.image}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="${d.site}" />
<meta name="twitter:title" content="${d.title}" />
<meta name="twitter:description" content="${d.description}" />
<meta name="twitter:image" content="${d.image}" />`;
  const fld = "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
  return (
    <UtilityPage title="Meta Tag Generator" description="Generate SEO, Open Graph and Twitter card meta tags ready to paste into your <head>.">
      <div className="grid gap-2">
        <input className={fld} value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} placeholder="Page title" />
        <textarea className={fld} rows={2} value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} placeholder="Description" />
        <input className={fld} value={d.url} onChange={(e) => setD({ ...d, url: e.target.value })} placeholder="Canonical URL" />
        <input className={fld} value={d.image} onChange={(e) => setD({ ...d, image: e.target.value })} placeholder="OG image URL" />
        <input className={fld} value={d.site} onChange={(e) => setD({ ...d, site: e.target.value })} placeholder="Twitter @handle" />
      </div>
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold">Generated tags</p>
          <button onClick={() => navigator.clipboard.writeText(tags)} className="inline-flex items-center gap-1 rounded-md border bg-surface px-2 py-1 text-xs hover:bg-muted"><Copy className="h-3 w-3" /> Copy</button>
        </div>
        <pre className="rounded-2xl border bg-muted/40 p-4 text-xs font-mono overflow-auto">{tags}</pre>
      </div>
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/meta-tag-generator")({
  head: () => ({ meta: [{ title: "Meta Tag Generator — Free SEO Tool | Pdfica" }, { name: "description", content: "Generate SEO, Open Graph, and Twitter card meta tags in one click." }] }),
  component: Page,
});

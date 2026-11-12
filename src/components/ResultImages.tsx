import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deliverFile } from "@/lib/format";
import type { OutputFile } from "@/lib/batch";

export function ResultImages({ images }: { images: OutputFile[] }) {
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    const next = images.map((image) => URL.createObjectURL(image.blob));
    setUrls(next);
    return () => next.forEach((url) => URL.revokeObjectURL(url));
  }, [images]);
  return <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
    {images.map((image, i) => <div key={i} className="overflow-hidden rounded-lg border bg-background">
      {urls[i] && <img src={urls[i]} alt={image.filename} className="aspect-[3/4] w-full object-contain" loading="lazy" />}
      <div className="flex items-center gap-2 border-t p-2"><span className="min-w-0 flex-1 truncate text-xs">{image.filename}</span><Button variant="ghost" size="icon" aria-label={`Download ${image.filename}`} onClick={() => void deliverFile(image.blob, image.filename)}><Download /></Button></div>
    </div>)}
  </div>;
}
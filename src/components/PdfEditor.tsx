import { useEffect, useRef, useState } from "react";
import { UploadCloud, ChevronLeft, ChevronRight, Download, Loader2, ScanText, Trash2, Undo2, Redo2, Type, Bold, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deliverFile, formatBytes } from "@/lib/format";
import { EDITOR_INK, exportEditorPdf, openEditorDocument, paintEditorPage, readEditorPage, scanEditorPage, type EditorEdits, type EditorPage, type TextEdit, type TextRegion } from "@/lib/pdf-editor";

export function PdfEditor() {
  const input = useRef<HTMLInputElement>(null);
  const documentRef = useRef<Awaited<ReturnType<typeof openEditorDocument>> | null>(null);
  const loading = useRef(false);
  const [file, setFile] = useState<File | null>(null);
  const [count, setCount] = useState(0);
  const [number, setNumber] = useState(1);
  const [pages, setPages] = useState<Record<number, EditorPage>>({});
  const [edits, setEdits] = useState<EditorEdits>({});
  const [past, setPast] = useState<EditorEdits[]>([]);
  const [future, setFuture] = useState<EditorEdits[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState<TextEdit>({ text: "", fontSize: 18, bold: false, color: EDITOR_INK.black });
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [adding, setAdding] = useState(false);
  const [language, setLanguage] = useState("eng");
  const [preview, setPreview] = useState("");
  const [download, setDownload] = useState<Blob | null>(null);
  const page = pages[number];
  const region = page?.regions.find((r) => r.id === selected);
  const changeCount = Object.values(edits).reduce((n, pageEdits) => n + Object.keys(pageEdits).length, 0);

  useEffect(() => {
    if (!page) { setPreview(""); return; }
    let alive = true;
    if (!Object.keys(edits[number] ?? {}).length) { setPreview(page.image); return; }
    void paintEditorPage(page, edits[number] ?? {}).then((canvas) => { if (alive) setPreview(canvas.toDataURL("image/png")); }).catch((e) => setError(e.message));
    return () => { alive = false; };
  }, [page, edits, number]);
  useEffect(() => () => { void documentRef.current?.destroy(); }, []);

  const commit = (next: EditorEdits) => {
    setPast((p) => [...p, edits]); setFuture([]); setEdits(next); setDownload(null);
  };
  const select = (r: TextRegion) => {
    setSelected(r.id); setAdding(false);
    setDraft(edits[number]?.[r.id] ?? { text: r.text, fontSize: r.fontSize, bold: false, color: EDITOR_INK.black });
  };
  const upload = async (next: File) => {
    if (loading.current) return;
    setError("");
    if (!next.name.toLowerCase().endsWith(".pdf") && next.type !== "application/pdf") { setError("Please choose a PDF file."); return; }
    if (!next.size || next.size > 100 * 1024 * 1024) { setError("Choose a non-empty PDF up to 100 MB."); return; }
    loading.current = true; setBusy("Reading PDF…");
    let doc: Awaited<ReturnType<typeof openEditorDocument>> | null = null;
    try {
      doc = await openEditorDocument(next);
      const first = await readEditorPage(doc, 1);
      await documentRef.current?.destroy(); documentRef.current = doc;
      setFile(next); setCount(doc.numPages); setNumber(1); setPages({ 1: first });
      setEdits({}); setPast([]); setFuture([]); setSelected(null); setDownload(null); setAdding(false);
    } catch (e) {
      await doc?.destroy();
      setError(e instanceof Error ? e.message : "This PDF could not be opened.");
    } finally { loading.current = false; setBusy(""); if (input.current) input.current.value = ""; }
  };
  const navigate = async (target: number) => {
    const doc = documentRef.current;
    if (!doc || loading.current || target < 1 || target > count) return;
    setSelected(null); setAdding(false); setError("");
    if (pages[target]) { setNumber(target); return; }
    loading.current = true; setBusy(`Reading page ${target}…`);
    try { const next = await readEditorPage(doc, target); setPages((p) => ({ ...p, [target]: next })); setNumber(target); }
    catch (e) { setError(e instanceof Error ? e.message : "Page could not be loaded."); }
    finally { loading.current = false; setBusy(""); }
  };
  const scan = async () => {
    if (!page || loading.current) return;
    loading.current = true; setError(""); setBusy("Preparing text recognition…");
    try {
      const regions = await scanEditorPage(page, language, (pct) => setBusy(`Recognizing page ${number} · ${pct}%`));
      if (!regions.length) { setError("No text was detected on this page. You can still add text."); return; }
      setPages((p) => ({ ...p, [number]: { ...page, regions: [...page.regions.filter((r) => !r.id.startsWith("scan-")), ...regions] } }));
      setSelected(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Text recognition failed. Please try again."); }
    finally { loading.current = false; setBusy(""); }
  };
  const save = async () => {
    if (!file || loading.current) return;
    loading.current = true; setError(""); setBusy("Preparing PDF…");
    try { setDownload(await exportEditorPdf(file, pages, edits, (n) => setBusy(`Saving page ${n} of ${count}…`))); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not save the PDF."); }
    finally { loading.current = false; setBusy(""); }
  };
  const addText = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!adding || !page || busy) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * page.width;
    const y = (e.clientY - rect.top) / rect.height * page.height;
    const r: TextRegion = { id: `new-${crypto.randomUUID()}`, text: "", x, y, width: Math.min(200, page.width - x), height: 28, fontSize: 22, fontFamily: "sans-serif" };
    setPages((p) => ({ ...p, [number]: { ...page, regions: [...page.regions, r] } })); select(r);
  };
  const apply = (deleting = false) => {
    if (!region) return;
    commit({ ...edits, [number]: { ...edits[number], [region.id]: { ...draft, text: deleting ? "" : draft.text } } });
    setSelected(null);
  };
  const undo = () => {
    const previous = past.at(-1); if (!previous) return;
    setFuture((f) => [edits, ...f]); setPast((p) => p.slice(0, -1)); setEdits(previous); setSelected(null); setDownload(null);
  };
  const redo = () => {
    const next = future[0]; if (!next) return;
    setPast((p) => [...p, edits]); setFuture((f) => f.slice(1)); setEdits(next); setSelected(null); setDownload(null);
  };

  return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="font-display text-4xl font-bold">Edit PDF</h1><p className="mt-2 text-muted-foreground">Your document. Your words.</p></div>
      {file && <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground"><FileText className="size-4 shrink-0" /><span className="max-w-52 truncate">{file.name}</span><Button variant="outline" disabled={!!busy} onClick={() => input.current?.click()}>Change PDF</Button></div>}
    </header>
    <input ref={input} type="file" accept=".pdf,application/pdf" aria-label="Upload PDF" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); }} />
    {error && <div role="alert" className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>}
    {!file ? <section onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) void upload(f); }} className={`grid min-h-80 place-items-center rounded-lg border-2 border-dashed p-8 text-center ${dragging ? "border-primary bg-accent" : "border-border bg-surface"}`}>
      <div><UploadCloud className="mx-auto mb-5 size-12 text-primary" /><h2 className="text-2xl font-semibold">Drop your PDF here</h2><p className="mt-2 text-sm text-muted-foreground">PDF · Up to 100 MB · Private, on your device</p><Button className="mt-6" size="lg" disabled={!!busy} onClick={() => input.current?.click()}>{busy ? <Loader2 className="animate-spin" /> : <UploadCloud />} {busy || "Select PDF"}</Button></div>
    </section> : <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-y py-3">
        <div className="flex items-center gap-1"><Button variant="ghost" size="icon" title="Previous page" aria-label="Previous page" disabled={!!busy || number === 1} onClick={() => void navigate(number - 1)}><ChevronLeft /></Button><span className="min-w-24 text-center text-sm tabular-nums">{number} / {count}</span><Button variant="ghost" size="icon" title="Next page" aria-label="Next page" disabled={!!busy || number === count} onClick={() => void navigate(number + 1)}><ChevronRight /></Button></div>
        <div className="flex flex-wrap items-center gap-2"><Button variant="ghost" size="icon" title="Undo" aria-label="Undo" disabled={!!busy || !past.length} onClick={undo}><Undo2 /></Button><Button variant="ghost" size="icon" title="Redo" aria-label="Redo" disabled={!!busy || !future.length} onClick={redo}><Redo2 /></Button><Button variant={adding ? "secondary" : "outline"} disabled={!!busy} onClick={() => { setAdding(!adding); setSelected(null); }}><Type />Add text</Button><Button disabled={!!busy || !changeCount} onClick={() => void save()}><Download />Save PDF</Button></div>
      </div>
      {busy && <p role="status" className="mb-4 flex items-center gap-2 text-sm text-primary"><Loader2 className="size-4 animate-spin" />{busy}</p>}
      {download && <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-success/40 bg-success/10 p-4"><div><p className="font-medium">Your edited PDF is ready</p><p className="text-sm text-muted-foreground">{formatBytes(download.size)}</p></div><Button onClick={() => void deliverFile(download, file.name.replace(/\.pdf$/i, "") + "-edited.pdf")}><Download />Download PDF</Button></div>}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 bg-muted p-3 sm:p-6">
          {page && <div onClick={addText} className={`pdf-editor-sheet relative mx-auto overflow-hidden shadow-card ${adding ? "cursor-crosshair" : ""}`} style={{ aspectRatio: `${page.width} / ${page.height}`, maxWidth: page.width }}>
            <img src={preview || page.image} alt={`PDF page ${number}`} className="block w-full" draggable={false} />
            {!adding && page.regions.map((r) => <Button key={r.id} variant="ghost" aria-label={`Edit text: ${edits[number]?.[r.id]?.text || r.text || "New text"}`} title={edits[number]?.[r.id]?.text || r.text || "Deleted text"} disabled={!!busy} onClick={(e) => { e.stopPropagation(); select(r); }} className={`pdf-text-region absolute min-h-0 rounded-none border p-0 ${selected === r.id ? "border-primary bg-primary/10" : "border-transparent hover:border-primary hover:bg-primary/10"}`} style={{ left: `${r.x / page.width * 100}%`, top: `${r.y / page.height * 100}%`, width: `${r.width / page.width * 100}%`, height: `${r.height / page.height * 100}%` }} />)}
          </div>}
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24">
          {region ? <fieldset disabled={!!busy} className="space-y-4 border-b pb-6">
            <div className="flex items-center justify-between"><h2 className="font-display text-lg font-semibold">Selected text</h2><Button variant="ghost" size="icon" aria-label="Close selection" onClick={() => setSelected(null)}><X /></Button></div>
            <label className="block text-sm font-medium">Text<textarea autoFocus aria-label="Selected text" rows={5} value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} className="mt-2 w-full resize-y rounded-md border bg-background p-3 font-normal focus:outline-none focus:ring-2 focus:ring-primary" /></label>
            <div className="flex items-end gap-3"><label className="flex-1 text-sm font-medium">Size (pt)<input type="number" min={4} max={96} aria-label="Text size" value={+(draft.fontSize / 1.5).toFixed(1)} onChange={(e) => setDraft({ ...draft, fontSize: Math.max(4, Math.min(96, +e.target.value)) * 1.5 })} className="mt-2 w-full rounded-md border bg-background p-2" /></label><Button variant={draft.bold ? "secondary" : "outline"} aria-label="Bold" aria-pressed={draft.bold} size="icon" onClick={() => setDraft({ ...draft, bold: !draft.bold })}><Bold /></Button></div>
            <div className="flex gap-2" aria-label="Text color">{Object.entries(EDITOR_INK).map(([name, color]) => <Button key={name} aria-label={`${name} text`} aria-pressed={draft.color === color} variant="outline" size="icon" className={draft.color === color ? "ring-2 ring-primary" : ""} onClick={() => setDraft({ ...draft, color })}><span className={`size-4 rounded-full editor-ink-${name}`} /></Button>)}</div>
            <div className="flex gap-2"><Button className="flex-1" onClick={() => apply()}>Apply change</Button><Button variant="destructive" size="icon" title="Delete selected text" aria-label="Delete selected text" onClick={() => apply(true)}><Trash2 /></Button></div>
          </fieldset> : <div className="border-b pb-6"><h2 className="font-display text-lg font-semibold">Page {number}</h2><p className="mt-2 text-sm text-muted-foreground">{page?.regions.length ?? 0} text sections detected</p><p className="mt-2 text-sm text-muted-foreground">{changeCount} change{changeCount === 1 ? "" : "s"}</p></div>}
          <fieldset disabled={!!busy} className="space-y-3"><h2 className="font-display font-semibold">Scanned text</h2><label className="block text-sm">Recognition language<select aria-label="Recognition language" value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-2 w-full rounded-md border bg-background p-2"><option value="eng">English</option><option value="hin+eng">Hindi + English</option><option value="spa">Spanish</option><option value="fra">French</option><option value="deu">German</option><option value="por">Portuguese</option></select></label><Button variant="outline" className="w-full" disabled={!!page?.regions.some((r) => r.id.startsWith("scan-"))} onClick={() => void scan()}><ScanText />Recognize page text</Button></fieldset>
          <p className="text-xs leading-relaxed text-muted-foreground">Edited pages are saved as images; their text, links and forms won’t remain selectable or interactive. Other pages stay unchanged. Fonts are approximated; recognition may need corrections.</p>
        </aside>
      </div>
    </>}
  </section>;
}
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";

function Page() {
  const [ts, setTs] = useState(Math.floor(Date.now() / 1000));
  const [dt, setDt] = useState(new Date().toISOString().slice(0, 16));
  const tsToDate = new Date(ts * 1000);
  const dtToTs = Math.floor(new Date(dt).getTime() / 1000);
  const fld = "w-full rounded-lg border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
  return (
    <UtilityPage title="Unix Timestamp Converter" description="Convert between Unix timestamps and human-readable dates.">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-surface p-5">
          <p className="text-sm font-semibold mb-2">Timestamp → Date</p>
          <input className={fld} type="number" value={ts} onChange={(e) => setTs(+e.target.value)} />
          <p className="mt-3 text-sm"><span className="text-muted-foreground">UTC:</span> {isNaN(+tsToDate) ? "—" : tsToDate.toUTCString()}</p>
          <p className="text-sm"><span className="text-muted-foreground">Local:</span> {isNaN(+tsToDate) ? "—" : tsToDate.toString()}</p>
        </div>
        <div className="rounded-2xl border bg-surface p-5">
          <p className="text-sm font-semibold mb-2">Date → Timestamp</p>
          <input className={fld} type="datetime-local" value={dt} onChange={(e) => setDt(e.target.value)} />
          <p className="mt-3 text-sm"><span className="text-muted-foreground">Unix (seconds):</span> <span className="font-mono">{isNaN(dtToTs) ? "—" : dtToTs}</span></p>
          <p className="text-sm"><span className="text-muted-foreground">Unix (ms):</span> <span className="font-mono">{isNaN(dtToTs) ? "—" : dtToTs * 1000}</span></p>
        </div>
      </div>
      <button onClick={() => setTs(Math.floor(Date.now() / 1000))} className="mt-4 rounded-full border bg-surface px-4 py-2 text-sm hover:bg-muted">Use current time</button>
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/timestamp-converter")({
  head: () => ({ meta: [{ title: "Unix Timestamp Converter — Free | Pdfica" }, { name: "description", content: "Convert between Unix timestamps and human-readable dates." }] }),
  component: Page,
});

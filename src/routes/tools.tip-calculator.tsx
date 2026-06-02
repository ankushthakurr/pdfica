import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";

function Page() {
  const [bill, setBill] = useState(50);
  const [tip, setTip] = useState(18);
  const [n, setN] = useState(2);
  const tipAmt = bill * (tip / 100);
  const total = bill + tipAmt;
  const per = total / Math.max(n, 1);
  const fld = "w-full rounded-lg border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
  return (
    <UtilityPage title="Tip Calculator" description="Split bills and calculate tips at any percentage.">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="block text-sm"><span className="font-medium">Bill amount</span><input className={fld + " mt-1"} type="number" value={bill} onChange={(e) => setBill(+e.target.value)} /></label>
        <label className="block text-sm"><span className="font-medium">Tip %</span><input className={fld + " mt-1"} type="number" value={tip} onChange={(e) => setTip(+e.target.value)} /></label>
        <label className="block text-sm"><span className="font-medium">People</span><input className={fld + " mt-1"} type="number" min={1} value={n} onChange={(e) => setN(+e.target.value)} /></label>
      </div>
      <div className="mt-4 flex gap-2 flex-wrap">
        {[10, 15, 18, 20, 25].map((t) => <button key={t} onClick={() => setTip(t)} className={`rounded-full px-3 py-1 text-xs border ${tip === t ? "bg-primary text-primary-foreground" : ""}`}>{t}%</button>)}
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3 text-center">
        <div className="rounded-2xl border bg-surface p-5"><p className="text-2xl font-bold">${tipAmt.toFixed(2)}</p><p className="text-xs text-muted-foreground mt-1">Tip amount</p></div>
        <div className="rounded-2xl border bg-surface p-5"><p className="text-2xl font-bold">${total.toFixed(2)}</p><p className="text-xs text-muted-foreground mt-1">Total</p></div>
        <div className="rounded-2xl bg-primary/10 p-5"><p className="text-2xl font-bold text-primary">${per.toFixed(2)}</p><p className="text-xs text-muted-foreground mt-1">Per person</p></div>
      </div>
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/tip-calculator")({
  head: () => ({ meta: [{ title: "Tip Calculator — Free | Pdfica" }, { name: "description", content: "Calculate tip amounts and split bills between any number of people." }] }),
  component: Page,
});

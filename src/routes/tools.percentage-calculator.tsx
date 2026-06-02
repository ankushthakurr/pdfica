import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";

function Page() {
  const [a, setA] = useState(20); const [b, setB] = useState(150);
  const [c, setC] = useState(45); const [d, setD] = useState(300);
  const [e, setE] = useState(80); const [f, setF] = useState(100);
  const fld = "w-20 rounded-lg border bg-background px-2 py-1 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
  const card = "rounded-2xl border bg-surface p-5";
  return (
    <UtilityPage title="Percentage Calculator" description="Three percentage calculators in one — fast, simple, free.">
      <div className="grid gap-4 md:grid-cols-3">
        <div className={card}>
          <p className="text-sm font-semibold mb-3">What is X% of Y?</p>
          <div className="flex items-center gap-2 text-sm">What is <input className={fld} type="number" value={a} onChange={(ev) => setA(+ev.target.value)} />% of <input className={fld} type="number" value={b} onChange={(ev) => setB(+ev.target.value)} />?</div>
          <p className="mt-4 text-2xl font-bold text-primary">{((a / 100) * b).toFixed(2)}</p>
        </div>
        <div className={card}>
          <p className="text-sm font-semibold mb-3">X is what % of Y?</p>
          <div className="flex items-center gap-2 text-sm"><input className={fld} type="number" value={c} onChange={(ev) => setC(+ev.target.value)} /> is what % of <input className={fld} type="number" value={d} onChange={(ev) => setD(+ev.target.value)} />?</div>
          <p className="mt-4 text-2xl font-bold text-primary">{d ? ((c / d) * 100).toFixed(2) : "0"}%</p>
        </div>
        <div className={card}>
          <p className="text-sm font-semibold mb-3">% change from X to Y</p>
          <div className="flex items-center gap-2 text-sm">From <input className={fld} type="number" value={e} onChange={(ev) => setE(+ev.target.value)} /> to <input className={fld} type="number" value={f} onChange={(ev) => setF(+ev.target.value)} /></div>
          <p className="mt-4 text-2xl font-bold text-primary">{e ? (((f - e) / e) * 100).toFixed(2) : "0"}%</p>
        </div>
      </div>
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/percentage-calculator")({
  head: () => ({ meta: [{ title: "Percentage Calculator — Free | Pdfica" }, { name: "description", content: "Three percentage calculators in one: percent of, percent change, X is what % of Y." }] }),
  component: Page,
});

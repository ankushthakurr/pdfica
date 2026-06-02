import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";

function Page() {
  const [p, setP] = useState(100000);
  const [r, setR] = useState(8.5);
  const [n, setN] = useState(60); // months
  const res = useMemo(() => {
    const m = r / 12 / 100;
    const emi = m === 0 ? p / n : (p * m * Math.pow(1 + m, n)) / (Math.pow(1 + m, n) - 1);
    const total = emi * n;
    return { emi, total, interest: total - p };
  }, [p, r, n]);
  const fmt = (v: number) => v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  const fld = "w-full rounded-lg border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
  return (
    <UtilityPage title="EMI / Loan Calculator" description="Calculate monthly EMI, total payment and interest for any loan.">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="block text-sm"><span className="font-medium">Loan amount</span><input className={fld + " mt-1"} type="number" value={p} onChange={(e) => setP(+e.target.value)} /></label>
        <label className="block text-sm"><span className="font-medium">Annual rate %</span><input className={fld + " mt-1"} type="number" step={0.1} value={r} onChange={(e) => setR(+e.target.value)} /></label>
        <label className="block text-sm"><span className="font-medium">Tenure (months)</span><input className={fld + " mt-1"} type="number" value={n} onChange={(e) => setN(+e.target.value)} /></label>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3 text-center">
        <div className="rounded-2xl bg-primary/10 p-5"><p className="text-3xl font-bold text-primary">{fmt(res.emi)}</p><p className="text-xs text-muted-foreground mt-1">Monthly EMI</p></div>
        <div className="rounded-2xl border bg-surface p-5"><p className="text-3xl font-bold">{fmt(res.interest)}</p><p className="text-xs text-muted-foreground mt-1">Total interest</p></div>
        <div className="rounded-2xl border bg-surface p-5"><p className="text-3xl font-bold">{fmt(res.total)}</p><p className="text-xs text-muted-foreground mt-1">Total payment</p></div>
      </div>
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/emi-calculator")({
  head: () => ({ meta: [{ title: "EMI / Loan Calculator — Free | Pdfica" }, { name: "description", content: "Free EMI calculator. Compute monthly loan payments, interest and totals." }] }),
  component: Page,
});

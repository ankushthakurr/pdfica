import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";

function diff(dob: Date, now: Date) {
  let y = now.getFullYear() - dob.getFullYear();
  let m = now.getMonth() - dob.getMonth();
  let d = now.getDate() - dob.getDate();
  if (d < 0) { m -= 1; const prev = new Date(now.getFullYear(), now.getMonth(), 0); d += prev.getDate(); }
  if (m < 0) { y -= 1; m += 12; }
  const totalDays = Math.floor((+now - +dob) / 86400000);
  return { y, m, d, totalDays, weeks: Math.floor(totalDays / 7), hours: Math.floor((+now - +dob) / 3600000), minutes: Math.floor((+now - +dob) / 60000) };
}

function Page() {
  const [dob, setDob] = useState("2000-01-01");
  const [as, setAs] = useState(new Date().toISOString().slice(0, 10));
  const res = useMemo(() => {
    const a = new Date(dob); const b = new Date(as);
    if (isNaN(+a) || isNaN(+b) || a > b) return null;
    return diff(a, b);
  }, [dob, as]);
  const fld = "w-full rounded-lg border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
  return (
    <UtilityPage title="Age Calculator" description="Calculate your age in years, months, days, weeks, hours and minutes.">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block text-sm"><span className="font-medium">Date of birth</span><input className={fld + " mt-1"} type="date" value={dob} onChange={(e) => setDob(e.target.value)} /></label>
        <label className="block text-sm"><span className="font-medium">Age at the date of</span><input className={fld + " mt-1"} type="date" value={as} onChange={(e) => setAs(e.target.value)} /></label>
      </div>
      {res && (
        <>
          <div className="mt-6 rounded-2xl bg-primary/10 p-6 text-center">
            <p className="font-display text-4xl font-bold text-primary">{res.y} years, {res.m} months, {res.d} days</p>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            {([["Total days", res.totalDays], ["Weeks", res.weeks], ["Hours", res.hours], ["Minutes", res.minutes]] as const).map(([k, v]) => (
              <div key={k} className="rounded-xl border bg-surface p-3"><p className="text-xl font-bold">{v.toLocaleString()}</p><p className="text-xs text-muted-foreground">{k}</p></div>
            ))}
          </div>
        </>
      )}
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/age-calculator")({
  head: () => ({ meta: [{ title: "Age Calculator — Free Online | Pdfica" }, { name: "description", content: "Calculate your exact age in years, months, days, hours and minutes." }] }),
  component: Page,
});

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { UtilityPage } from "@/components/UtilityPage";

function Page() {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [h, setH] = useState(170);
  const [w, setW] = useState(70);
  const bmi = useMemo(() => {
    if (unit === "metric") return w / Math.pow(h / 100, 2);
    return (w / (h * h)) * 703;
  }, [unit, h, w]);
  const cat = bmi < 18.5 ? ["Underweight", "text-blue-500"] : bmi < 25 ? ["Healthy", "text-emerald-500"] : bmi < 30 ? ["Overweight", "text-amber-500"] : ["Obese", "text-red-500"];
  const fld = "w-full rounded-lg border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
  return (
    <UtilityPage title="BMI Calculator" description="Calculate your Body Mass Index using metric or imperial units.">
      <div className="flex gap-2 mb-4 text-sm">
        {(["metric", "imperial"] as const).map((u) => (
          <button key={u} onClick={() => setUnit(u)} className={`rounded-full px-4 py-1.5 capitalize ${unit === u ? "bg-primary text-primary-foreground" : "border"}`}>{u}</button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block text-sm"><span className="font-medium">Height ({unit === "metric" ? "cm" : "inches"})</span><input className={fld + " mt-1"} type="number" value={h} onChange={(e) => setH(+e.target.value)} /></label>
        <label className="block text-sm"><span className="font-medium">Weight ({unit === "metric" ? "kg" : "lbs"})</span><input className={fld + " mt-1"} type="number" value={w} onChange={(e) => setW(+e.target.value)} /></label>
      </div>
      {bmi > 0 && isFinite(bmi) && (
        <div className="mt-6 rounded-2xl bg-primary/10 p-6 text-center">
          <p className="font-display text-5xl font-bold text-primary">{bmi.toFixed(1)}</p>
          <p className={`mt-1 text-lg font-semibold ${cat[1]}`}>{cat[0]}</p>
          <p className="mt-2 text-xs text-muted-foreground">Healthy BMI range: 18.5 – 24.9</p>
        </div>
      )}
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/bmi-calculator")({
  head: () => ({ meta: [{ title: "BMI Calculator — Free Online | Pdfica" }, { name: "description", content: "Free Body Mass Index calculator with metric and imperial units." }] }),
  component: Page,
});

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { jsPDF } from "jspdf";
import { UtilityPage } from "@/components/UtilityPage";
import { downloadBlob } from "@/lib/format";
import { Download, Plus, Trash2 } from "lucide-react";

interface Item { desc: string; qty: number; price: number }

function Page() {
  const [from, setFrom] = useState({ name: "Acme Studio", email: "hello@acme.com", addr: "123 Main St\nNew York, NY" });
  const [to, setTo] = useState({ name: "Client Co", email: "client@example.com", addr: "456 Park Ave\nBoston, MA" });
  const [meta, setMeta] = useState({ number: "INV-001", date: new Date().toISOString().slice(0, 10), due: "", currency: "$" });
  const [items, setItems] = useState<Item[]>([{ desc: "Consulting services", qty: 10, price: 150 }]);
  const [tax, setTax] = useState(0);
  const [notes, setNotes] = useState("Thank you for your business!");

  const sub = items.reduce((a, i) => a + i.qty * i.price, 0);
  const taxAmt = sub * (tax / 100);
  const total = sub + taxAmt;

  const setItem = (i: number, p: Partial<Item>) => setItems(items.map((x, k) => (k === i ? { ...x, ...p } : x)));

  const generate = () => {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const W = pdf.internal.pageSize.getWidth(); const M = 48;
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(28); pdf.text("INVOICE", M, 70);
    pdf.setFontSize(10); pdf.setFont("helvetica", "normal");
    pdf.text(`# ${meta.number}`, W - M, 60, { align: "right" });
    pdf.text(`Date: ${meta.date}`, W - M, 75, { align: "right" });
    if (meta.due) pdf.text(`Due: ${meta.due}`, W - M, 90, { align: "right" });

    pdf.setFont("helvetica", "bold"); pdf.text("From", M, 120);
    pdf.text("Bill to", W / 2, 120);
    pdf.setFont("helvetica", "normal");
    [from.name, from.email, ...from.addr.split("\n")].forEach((l, i) => pdf.text(l, M, 138 + i * 14));
    [to.name, to.email, ...to.addr.split("\n")].forEach((l, i) => pdf.text(l, W / 2, 138 + i * 14));

    let y = 230;
    pdf.setFillColor(240, 240, 240); pdf.rect(M, y - 14, W - M * 2, 22, "F");
    pdf.setFont("helvetica", "bold");
    pdf.text("Description", M + 8, y); pdf.text("Qty", W - M - 200, y); pdf.text("Price", W - M - 130, y); pdf.text("Amount", W - M - 8, y, { align: "right" });
    pdf.setFont("helvetica", "normal"); y += 22;
    for (const it of items) {
      pdf.text(it.desc.slice(0, 60), M + 8, y);
      pdf.text(String(it.qty), W - M - 200, y);
      pdf.text(`${meta.currency}${it.price.toFixed(2)}`, W - M - 130, y);
      pdf.text(`${meta.currency}${(it.qty * it.price).toFixed(2)}`, W - M - 8, y, { align: "right" });
      y += 18;
    }
    y += 10; pdf.line(M, y, W - M, y); y += 20;
    pdf.text("Subtotal", W - M - 130, y); pdf.text(`${meta.currency}${sub.toFixed(2)}`, W - M - 8, y, { align: "right" }); y += 16;
    if (tax) { pdf.text(`Tax (${tax}%)`, W - M - 130, y); pdf.text(`${meta.currency}${taxAmt.toFixed(2)}`, W - M - 8, y, { align: "right" }); y += 16; }
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(13);
    pdf.text("Total", W - M - 130, y + 6); pdf.text(`${meta.currency}${total.toFixed(2)}`, W - M - 8, y + 6, { align: "right" });
    if (notes) {
      pdf.setFont("helvetica", "italic"); pdf.setFontSize(10);
      pdf.text(notes, M, y + 60, { maxWidth: W - M * 2 });
    }
    downloadBlob(pdf.output("blob"), `${meta.number}.pdf`);
  };

  const fld = "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
  return (
    <UtilityPage title="Free Invoice Generator" description="Create a professional PDF invoice in seconds. No sign-up, no watermark.">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="text-sm font-bold">From</div>
          <input className={fld} value={from.name} onChange={(e) => setFrom({ ...from, name: e.target.value })} placeholder="Your name / company" />
          <input className={fld} value={from.email} onChange={(e) => setFrom({ ...from, email: e.target.value })} placeholder="Email" />
          <textarea className={fld} rows={2} value={from.addr} onChange={(e) => setFrom({ ...from, addr: e.target.value })} placeholder="Address" />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-bold">Bill to</div>
          <input className={fld} value={to.name} onChange={(e) => setTo({ ...to, name: e.target.value })} placeholder="Client name" />
          <input className={fld} value={to.email} onChange={(e) => setTo({ ...to, email: e.target.value })} placeholder="Client email" />
          <textarea className={fld} rows={2} value={to.addr} onChange={(e) => setTo({ ...to, addr: e.target.value })} placeholder="Address" />
        </div>
      </div>
      <div className="mt-5 grid gap-2 md:grid-cols-4">
        <input className={fld} value={meta.number} onChange={(e) => setMeta({ ...meta, number: e.target.value })} placeholder="Invoice #" />
        <input className={fld} type="date" value={meta.date} onChange={(e) => setMeta({ ...meta, date: e.target.value })} />
        <input className={fld} type="date" value={meta.due} onChange={(e) => setMeta({ ...meta, due: e.target.value })} placeholder="Due date" />
        <input className={fld} value={meta.currency} onChange={(e) => setMeta({ ...meta, currency: e.target.value })} placeholder="$" />
      </div>
      <div className="mt-6">
        <div className="text-sm font-bold mb-2">Items</div>
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-[1fr_70px_90px_30px] gap-2 mb-2">
            <input className={fld} value={it.desc} onChange={(e) => setItem(i, { desc: e.target.value })} placeholder="Description" />
            <input className={fld} type="number" value={it.qty} onChange={(e) => setItem(i, { qty: +e.target.value })} />
            <input className={fld} type="number" value={it.price} onChange={(e) => setItem(i, { price: +e.target.value })} />
            <button onClick={() => setItems(items.filter((_, k) => k !== i))} className="rounded-lg border p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
        <button onClick={() => setItems([...items, { desc: "", qty: 1, price: 0 }])} className="inline-flex items-center gap-1 rounded-lg border bg-surface px-3 py-2 text-sm hover:bg-muted">
          <Plus className="h-4 w-4" /> Add item
        </button>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="text-sm"><span className="font-medium">Tax %</span>
          <input type="number" className={fld + " mt-1"} value={tax} onChange={(e) => setTax(+e.target.value)} />
        </label>
        <div className="rounded-2xl border bg-muted/40 p-4 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{meta.currency}{sub.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Tax</span><span>{meta.currency}{taxAmt.toFixed(2)}</span></div>
          <div className="mt-1 flex justify-between border-t pt-1 font-bold"><span>Total</span><span>{meta.currency}{total.toFixed(2)}</span></div>
        </div>
      </div>
      <textarea className={fld + " mt-4"} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes / terms" />
      <div className="mt-5 flex justify-end">
        <button onClick={generate} className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:scale-[1.03] transition-transform">
          <Download className="h-4 w-4" /> Download PDF Invoice
        </button>
      </div>
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/invoice-generator")({
  head: () => ({ meta: [{ title: "Free Invoice Generator — PDF in Seconds | Pdfica" }, { name: "description", content: "Create and download a professional PDF invoice for free. No sign-up, no watermark." }] }),
  component: Page,
});

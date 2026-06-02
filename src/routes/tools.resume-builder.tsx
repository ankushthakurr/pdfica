import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { jsPDF } from "jspdf";
import { UtilityPage } from "@/components/UtilityPage";
import { downloadBlob } from "@/lib/format";
import { Download } from "lucide-react";

function Page() {
  const [d, setD] = useState({
    name: "Jane Doe", title: "Senior Product Designer",
    email: "jane@example.com", phone: "+1 555 123 4567", location: "New York, NY", website: "janedoe.com",
    summary: "Designer with 8+ years building delightful, accessible products for B2B SaaS and consumer apps.",
    experience: "Acme Inc. — Senior Designer (2021–Present)\n• Led design system used across 12 product teams\n• Shipped onboarding redesign, increased activation by 34%\n\nBeta Co. — Designer (2018–2021)\n• Owned mobile app from 0 to 1M users",
    education: "B.A. Design — Parsons School of Design, 2017",
    skills: "Figma, Design Systems, Prototyping, User Research, HTML/CSS, React",
  });

  const generate = () => {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const W = pdf.internal.pageSize.getWidth(); const M = 56;
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(26); pdf.text(d.name, M, 80);
    pdf.setFontSize(13); pdf.setFont("helvetica", "normal"); pdf.setTextColor(80); pdf.text(d.title, M, 102);
    pdf.setFontSize(10); pdf.setTextColor(110);
    const meta = [d.email, d.phone, d.location, d.website].filter(Boolean).join("  ·  ");
    pdf.text(meta, M, 120);
    pdf.setDrawColor(220); pdf.line(M, 132, W - M, 132);

    let y = 156;
    const section = (title: string, body: string) => {
      if (!body.trim()) return;
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(11); pdf.setTextColor(20);
      pdf.text(title.toUpperCase(), M, y); y += 14;
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.setTextColor(40);
      const lines = pdf.splitTextToSize(body, W - M * 2);
      for (const ln of lines) {
        if (y > 800) { pdf.addPage(); y = 60; }
        pdf.text(ln, M, y); y += 13;
      }
      y += 10;
    };
    section("Summary", d.summary);
    section("Experience", d.experience);
    section("Education", d.education);
    section("Skills", d.skills);
    downloadBlob(pdf.output("blob"), `${d.name.replace(/\s+/g, "-")}-resume.pdf`);
  };
  const fld = "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
  return (
    <UtilityPage title="Free Resume Builder" description="Fill in your details and download a clean, ATS-friendly PDF resume.">
      <div className="grid gap-2 md:grid-cols-2">
        <input className={fld} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} placeholder="Full name" />
        <input className={fld} value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} placeholder="Job title" />
        <input className={fld} value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} placeholder="Email" />
        <input className={fld} value={d.phone} onChange={(e) => setD({ ...d, phone: e.target.value })} placeholder="Phone" />
        <input className={fld} value={d.location} onChange={(e) => setD({ ...d, location: e.target.value })} placeholder="Location" />
        <input className={fld} value={d.website} onChange={(e) => setD({ ...d, website: e.target.value })} placeholder="Website / LinkedIn" />
      </div>
      {[
        ["Summary", "summary"],
        ["Experience", "experience"],
        ["Education", "education"],
        ["Skills", "skills"],
      ].map(([label, k]) => (
        <label key={k} className="mt-4 block text-sm">
          <span className="font-medium">{label}</span>
          <textarea rows={k === "experience" ? 6 : 3} className={fld + " mt-1"} value={(d as never as Record<string, string>)[k]}
            onChange={(e) => setD({ ...d, [k]: e.target.value })} />
        </label>
      ))}
      <div className="mt-5 flex justify-end">
        <button onClick={generate} className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:scale-[1.03] transition-transform">
          <Download className="h-4 w-4" /> Download PDF Resume
        </button>
      </div>
    </UtilityPage>
  );
}

export const Route = createFileRoute("/tools/resume-builder")({
  head: () => ({ meta: [{ title: "Free Resume Builder — PDF Resume in Minutes | Pdfica" }, { name: "description", content: "Build a clean, ATS-friendly resume and download as PDF — free, no sign-up." }] }),
  component: Page,
});

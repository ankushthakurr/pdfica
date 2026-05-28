import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { CheckCircle2, Mail, MessageSquare, User } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100),
  email: z.string().trim().email("Please enter a valid email.").max(255),
  message: z.string().trim().min(10, "Tell us a bit more (10+ characters).").max(2000),
});

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Pdfica" },
      { name: "description", content: "Reach the Pdfica team with questions, feedback, or partnership ideas." },
      { property: "og:title", content: "Contact Pdfica" },
      { property: "og:description", content: "Get in touch with the Pdfica team." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [data, setData] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof data, string>>>({});
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(data);
    if (!r.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of r.error.issues) {
        const k = issue.path[0] as keyof typeof data;
        if (!fieldErrors[k]) fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 md:py-20">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Contact</p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold">
            We'd love to hear from you.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Questions, feedback, ideas for new tools, or partnership requests — drop us a line and
            we'll get back to you.
          </p>
          <div className="mt-8 space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-muted-foreground">hello@pdfica.in</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold">Typical response time</p>
                <p className="text-muted-foreground">Within two business days.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border bg-surface p-6 md:p-8 shadow-card">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-10 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 14 }}
                  className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success"
                >
                  <CheckCircle2 className="h-7 w-7" />
                </motion.div>
                <h3 className="font-display text-2xl font-bold">Message sent!</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Thanks {data.name.split(" ")[0]} — we'll get back to you at {data.email} soon.
                </p>
                <button
                  onClick={() => {
                    setSent(false);
                    setData({ name: "", email: "", message: "" });
                  }}
                  className="mt-6 rounded-full border bg-surface px-5 py-2.5 text-sm font-semibold hover:bg-muted"
                >
                  Send another
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={submit}
                className="space-y-4"
              >
                <Field
                  label="Name"
                  icon={<User className="h-4 w-4" />}
                  error={errors.name}
                  value={data.name}
                  onChange={(v) => setData({ ...data, name: v })}
                />
                <Field
                  label="Email"
                  type="email"
                  icon={<Mail className="h-4 w-4" />}
                  error={errors.email}
                  value={data.email}
                  onChange={(v) => setData({ ...data, email: v })}
                />
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <textarea
                    rows={5}
                    value={data.message}
                    onChange={(e) => setData({ ...data, message: e.target.value })}
                    className="mt-1 w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:scale-[1.02] transition-transform"
                >
                  Send message
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, error, icon, type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  icon?: React.ReactNode;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <div className="relative mt-1">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border bg-background py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${
            icon ? "pl-9 pr-3" : "px-3"
          }`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

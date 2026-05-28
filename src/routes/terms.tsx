import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Pdfica" },
      { name: "description", content: "Terms of service for using the free Pdfica PDF tools." },
      { property: "og:title", content: "Terms of Service — Pdfica" },
      { property: "og:description", content: "The rules for using Pdfica." },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 md:py-16">
      <h1 className="font-display text-4xl md:text-5xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: May 28, 2026</p>

      <section className="mt-8 space-y-4 text-foreground/85 leading-relaxed">
        <p>
          By using Pdfica (pdfica.in), you agree to these terms. They are short and written in plain English because the service is simple.
        </p>

        <h2 className="mt-8 font-display text-2xl font-bold text-foreground">1. What Pdfica is</h2>
        <p>
          Pdfica is a collection of browser-based PDF utilities. All tools run on your own device using JavaScript. We do not operate a server-side document pipeline and do not receive any of the files you process.
        </p>

        <h2 className="mt-8 font-display text-2xl font-bold text-foreground">2. Free of charge</h2>
        <p>
          Every tool on Pdfica is free to use. There is no subscription, no signup, no daily limit, and no watermark on output files. We may add optional paid features in the future; if we do, the core free tools will remain free.
        </p>

        <h2 className="mt-8 font-display text-2xl font-bold text-foreground">3. Acceptable use</h2>
        <p>
          You agree to use Pdfica only with files you have the legal right to process. Do not use the Unlock PDF tool to remove protection from documents you do not own. Do not use Pdfica to infringe on intellectual property, distribute malware, or violate any law.
        </p>

        <h2 className="mt-8 font-display text-2xl font-bold text-foreground">4. No warranty</h2>
        <p>
          Pdfica is provided "as is" without warranties of any kind. We do our best to make every tool reliable, but we cannot guarantee that conversions or operations will be lossless or perfect for every input. Always keep a backup of the original file before processing.
        </p>

        <h2 className="mt-8 font-display text-2xl font-bold text-foreground">5. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, Pdfica and its operators are not liable for any indirect, incidental, or consequential damages arising from your use of the service. Because we never receive your files, we are also not liable for any loss of data on your device.
        </p>

        <h2 className="mt-8 font-display text-2xl font-bold text-foreground">6. Third-party content</h2>
        <p>
          The site uses open-source libraries including pdf-lib, pdf.js, docx, and others. These are governed by their own licenses. Blog images may be sourced from Unsplash under their license.
        </p>

        <h2 className="mt-8 font-display text-2xl font-bold text-foreground">7. Changes</h2>
        <p>
          We may update these terms occasionally. The "last updated" date at the top will reflect the most recent change. Continued use of the site after a change constitutes acceptance.
        </p>

        <h2 className="mt-8 font-display text-2xl font-bold text-foreground">8. Governing law</h2>
        <p>
          These terms are governed by the laws of India. Any dispute will be subject to the exclusive jurisdiction of the courts there.
        </p>
      </section>
    </div>
  );
}

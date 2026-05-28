import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Pdfica" },
      { name: "description", content: "Pdfica processes every file entirely in your browser. We never upload, store, or see your documents." },
      { property: "og:title", content: "Privacy Policy — Pdfica" },
      { property: "og:description", content: "How Pdfica protects your privacy." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 md:py-16 prose-base">
      <h1 className="font-display text-4xl md:text-5xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: May 28, 2026</p>

      <section className="mt-8 space-y-4 text-foreground/85 leading-relaxed">
        <p>
          Pdfica (pdfica.in) is built on a single, simple principle: <strong>your files should never leave your device</strong>. This page explains exactly what that means in practice.
        </p>

        <h2 className="mt-8 font-display text-2xl font-bold text-foreground">1. Your files</h2>
        <p>
          Every PDF tool on this site — merge, split, compress, convert, organize, protect, unlock — runs entirely in your browser using JavaScript libraries that execute on your own device. We do not upload your files to any server. There is no server-side processing pipeline. We literally cannot see your documents because they never reach us.
        </p>

        <h2 className="mt-8 font-display text-2xl font-bold text-foreground">2. Personal data</h2>
        <p>
          Pdfica does not require an account, email address, or any personal information to use any of our tools. We do not ask you to sign up, log in, or pay.
        </p>

        <h2 className="mt-8 font-display text-2xl font-bold text-foreground">3. Cookies and analytics</h2>
        <p>
          Pdfica does not set tracking cookies. We do not run third-party advertising trackers or behavioural analytics. The site may store small amounts of preference data (such as your selected page size in the JPG to PDF tool) in your browser's local storage; this never leaves your device.
        </p>

        <h2 className="mt-8 font-display text-2xl font-bold text-foreground">4. Contact form</h2>
        <p>
          The Contact Us form on this site is purely a frontend convenience. Messages submitted through it are not transmitted to our servers and we do not receive them. To reach us, use the email address listed on the Contact page.
        </p>

        <h2 className="mt-8 font-display text-2xl font-bold text-foreground">5. Third-party assets</h2>
        <p>
          The site loads fonts from Google Fonts and a small number of images from Unsplash for the blog. These services may receive your IP address as part of standard HTTP requests. We do not share any other information with them.
        </p>

        <h2 className="mt-8 font-display text-2xl font-bold text-foreground">6. Children's privacy</h2>
        <p>
          Pdfica is a general-purpose utility and is not directed at children under 13. Because we do not collect any personal information, we have no information to delete.
        </p>

        <h2 className="mt-8 font-display text-2xl font-bold text-foreground">7. Changes</h2>
        <p>
          If we ever change how Pdfica handles privacy, we will update the date at the top of this page and post a notice on the homepage.
        </p>

        <h2 className="mt-8 font-display text-2xl font-bold text-foreground">8. Contact</h2>
        <p>
          Questions about this policy can be sent through our Contact page. Because we operate from India, this policy is governed by the laws of India.
        </p>
      </section>
    </div>
  );
}

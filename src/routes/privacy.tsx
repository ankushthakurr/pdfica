import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Pdfica" },
      { name: "description", content: "Pdfica processes every file entirely in your browser. We never upload, store, or see your documents." },
      { property: "og:title", content: "Privacy Policy — Pdfica" },
      { property: "og:description", content: "How Pdfica protects your privacy." },
    
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 md:py-16 prose-base">
      <h1 className="font-display text-4xl md:text-5xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: November 12, 2026</p>

      <section className="mt-8 space-y-4 text-foreground/85 leading-relaxed">
        <p>
          Pdfica offers free document and image tools. This page explains local file processing, optional speech services, and website measurement.
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
          No Google advertising tags are currently installed in this application. Lovable provides cookie-free visitor analytics: it stores nothing on your device, does not keep IP addresses, and does not identify visitors. It records pages visited, referral sources, country, browser, operating system, device type, time on page, page speed, errors, and clicks. Page visits and interactions are measured for every visitor with the current setup. Detailed data is kept for 90 days and daily summaries for a year.
        </p>

        <p>Lovable collects this data for us. <a href="https://lovable.dev/privacy" className="text-primary underline">Lovable’s privacy policy</a> explains how it handles it.</p>
        <h2 className="mt-8 font-display text-2xl font-bold text-foreground">4. Contact form</h2>
        <p>
          The Contact form prepares an email in your own email application. It does not send a message automatically or store your message on Pdfica. Sending the email shares your name, address, and message with your email provider and the recipient.
        </p>

        <h2 className="mt-8 font-display text-2xl font-bold text-foreground">5. Third-party assets</h2>
        <p>
          Google Fonts and Unsplash supply fonts and blog images. YouTube supplies thumbnails when you use that tool. These services receive standard network information such as IP address. Downloadable Text to Speech sends the text and selected voice to StreamElements to generate an MP3; do not use confidential text. Browser speech preview uses the voices supplied by your browser or operating system, which may use its own online services. OCR downloads recognition software and English language data, but processes document images locally.
        </p>

        <h2 className="mt-8 font-display text-2xl font-bold text-foreground">Advertising</h2>
        <p>Advertising is not currently enabled. Before Google AdSense is activated, this policy must be updated to reflect the actual advertising configuration. Google and its partners may use cookies to serve and measure ads, including personalized ads based on previous visits. A Google-certified consent platform must be configured where required, including the EEA, UK, and Switzerland. You can manage personalization at <a className="text-primary underline" href="https://myadcenter.google.com/">Google My Ad Center</a>.</p>
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

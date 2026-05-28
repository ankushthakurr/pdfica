# Pdfica — iLovePDF-style PDF Toolkit

A fully client-side PDF utility site. No signup, no backend processing — every file stays in the browser. Built on the existing TanStack Start + Tailwind v4 stack.

## Brand & Design System

- **Name:** Pdfica · **Domain:** pdfica.in
- **Palette** (added as oklch tokens in `src/styles.css`):
  - Primary (PDF Red/Orange): `#E53E3E`
  - Secondary (Deep Slate): `#1A202C`
  - Background: `#F7FAFC`, Surface white, Muted slate
- **Typography:** Display = Space Grotesk, Body = Inter (Google Fonts via `<link>` in `__root.tsx`)
- **Motion:** Framer Motion for page/tool transitions, floating tool cards, hover scale, success checkmark; Tailwind keyframes for shimmer skeletons and drag-zone pulse
- **Header:** Sticky glassmorphism (`backdrop-blur` + translucent bg) with a mega-menu listing all 8 tools grouped (Organize / Optimize / Convert / Security)
- **Footer:** Multi-column with tool links, blog, legal, social

## Routes (TanStack file-based)

```
src/routes/
  __root.tsx              header + footer shell, fonts, sitewide meta
  index.tsx               hero + categorized tools grid + features
  tools.merge.tsx
  tools.split.tsx
  tools.compress.tsx
  tools.pdf-to-word.tsx
  tools.word-to-pdf.tsx
  tools.pdf-to-jpg.tsx
  tools.jpg-to-pdf.tsx
  tools.organize.tsx
  tools.protect.tsx
  tools.unlock.tsx
  blog.index.tsx          magazine-style listing
  blog.$slug.tsx          3 seeded articles with internal tool links
  privacy.tsx
  terms.tsx
  contact.tsx             frontend-only form (toast on submit)
```

Each route gets its own `head()` with unique title + description + og tags.

## Shared Tool Workspace

A single `ToolWorkspace` component used by every tool page provides:
- Animated drag-and-drop zone (border pulse, file-icon bounce on drop)
- Multi-file list with thumbnails (rendered via pdf.js page 1 preview)
- Right-side configuration sidebar (tool-specific options slot)
- Primary processing CTA with progress bar + shimmer
- Success state with animated checkmark and "Download" button
- All processing in a Web Worker where heavy (compress, organize)

## Tool Implementations (100% client-side)

| Tool | Library | Approach |
|---|---|---|
| Merge | pdf-lib | `PDFDocument.create` + `copyPages` in user-chosen order |
| Split | pdf-lib | Parse page ranges → emit one or many PDFs (zipped via JSZip if multi) |
| Compress | pdf-lib + pdfjs | Re-encode embedded images to JPEG at chosen quality, strip metadata |
| PDF → Word | pdfjs-dist + docx | Extract text per page → build `.docx` paragraphs (clean text conversion, layout-light) |
| Word → PDF | mammoth + pdf-lib | DOCX → HTML → render to PDF pages with jsPDF html mode |
| PDF → JPG | pdfjs-dist | Render each page to canvas → export JPG(s), zip if multi |
| JPG → PDF | pdf-lib | Embed each image, sized to page, configurable orientation/margin |
| Organize | pdf-lib + dnd-kit | Visual grid of page thumbs; drag-reorder, rotate 90°, delete; export reordered PDF |
| Protect | pdf-lib *(qpdf-wasm fallback if needed)* | Password-encrypt output. pdf-lib lacks native encryption → use `@cantoo/pdf-lib` fork which supports AES-128 encryption |
| Unlock | pdf-lib fork above | Decrypt with provided password, re-save unencrypted |

Honest note on Protect/Unlock: standard pdf-lib doesn't ship encryption. The `@cantoo/pdf-lib` fork is a drop-in with AES support and will be used for those two tools.

## Blog (SEO seed content)

Three real articles authored in MDX-style React content:
1. "How to Edit PDFs in Your Browser Without Uploading Them" → links to Organize, Merge, Split
2. "5 Proven Ways to Compress PDFs Without Killing Quality" → links to Compress
3. "Word to PDF and Back: The Complete Conversion Guide" → links to PDF↔Word

Each post has hero image, reading time, author block, related tools card.

## Legal Pages

- **Privacy:** emphasizes 100% on-device processing, no uploads, no tracking, no cookies beyond essentials
- **Terms:** standard free-use, no warranty, jurisdiction India
- **Contact:** name/email/message form with zod validation + sonner toast (no backend send; states message stored locally only)

## Technical Notes

- Add deps: `pdf-lib` (or `@cantoo/pdf-lib`), `pdfjs-dist`, `docx`, `mammoth`, `jspdf`, `jszip`, `file-saver`, `framer-motion`, `@dnd-kit/core`, `@dnd-kit/sortable`
- pdfjs worker loaded via Vite `?url` import (Worker-safe, no CDN dependency)
- Everything runs in browser — no server functions needed; Lovable Cloud not enabled
- SEO: per-route head(), canonical = relative, sitemap.xml with all routes, robots.txt allowing all

## Out of Scope (called out honestly)

- True OCR-quality PDF→Word with layout fidelity (would need server). We deliver clean text extraction into a well-formatted docx.
- PDFs with non-standard encryption beyond AES-128.

Ready to build on approval.
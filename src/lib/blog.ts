export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: string;
  date: string;
  author: string;
  hero: string;
  relatedTools: string[];
  body: string; // markdown-ish; rendered with simple sectioning
}

const HERO_EDIT =
  "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1600&q=80";
const HERO_COMPRESS =
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80";
const HERO_WORD =
  "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1600&q=80";

export const POSTS: BlogPost[] = [
  {
    slug: "edit-pdfs-in-browser",
    title: "How to Edit PDFs in Your Browser Without Uploading Them",
    excerpt:
      "You don't need a desktop app or a paid service to reorganize, split, or merge PDFs. Here's how to do it 100% privately in your browser.",
    category: "Tutorials",
    readingTime: "6 min read",
    date: "May 12, 2026",
    author: "The Pdfica Team",
    hero: HERO_EDIT,
    relatedTools: ["organize", "merge", "split"],
    body: `For most people, editing a PDF still means opening a desktop app or uploading their file to a cloud service. Both options have problems — desktop apps are expensive, and most cloud editors quietly upload your file to a third-party server before you ever see a result.

There is a better way. Modern browsers can run PDF processing libraries directly, which means the entire job — opening, reordering, and saving — can happen on your own device. Nothing ever leaves your computer.

## Step 1: Pick the right tool

If you just need to combine files, use a [Merge PDF](/tools/merge) tool. If you need to extract a few pages, use [Split PDF](/tools/split). And if you want a visual page editor — the kind where you can drag thumbnails around — use [Organize PDF](/tools/organize).

## Step 2: Drop your file in

Every modern in-browser tool supports drag-and-drop. The file is read into memory using the standard File API; no upload request is ever made.

## Step 3: Make your changes

In the Organize tool, you'll see a thumbnail of every page. Drag to reorder, click rotate to spin a page, click delete to drop a page entirely. None of this touches the original file — it's all happening in memory.

## Step 4: Export

When you're happy with the result, click export. The library re-encodes the PDF locally and triggers a normal browser download. That's it. Nothing was uploaded, nothing was logged, nothing was stored.

## Why this matters

PDFs often contain sensitive information — contracts, ID cards, medical records, tax documents. Sending these through an unknown cloud editor is a real risk. A tool that runs in your browser eliminates that risk entirely, because there is no server to leak from.

Try it yourself: open the [Organize PDF](/tools/organize) tool, drop in any file, and watch your network tab. You'll see no upload requests at all.`,
  },
  {
    slug: "compress-pdf-without-losing-quality",
    title: "5 Proven Ways to Compress PDFs Without Killing Quality",
    excerpt:
      "PDFs can balloon out of control fast. Here are five techniques that shrink files dramatically without making the result look bad.",
    category: "Guides",
    readingTime: "5 min read",
    date: "April 28, 2026",
    author: "The Pdfica Team",
    hero: HERO_COMPRESS,
    relatedTools: ["compress", "pdf-to-jpg"],
    body: `Large PDFs are a daily headache. They clog inboxes, hit attachment limits, and take ages to load over slow connections. The good news: most PDFs are way bigger than they need to be — and you can fix that without a noticeable loss in quality.

## 1. Re-encode embedded images

The single biggest contributor to PDF size is uncompressed or lightly-compressed images. Re-encoding them as JPEG at around 80% quality typically cuts the file in half with no visible difference. Our [Compress PDF](/tools/compress) tool does this automatically.

## 2. Strip metadata

Many PDFs carry hidden metadata — author names, software fingerprints, edit history — that adds size and leaks information. Stripping it costs nothing and shaves kilobytes.

## 3. Drop embedded fonts you don't need

Embedded font subsets are necessary when a PDF is meant to be edited or printed exactly. For sharing? Usually overkill. A subset of just the glyphs actually used can be a fraction of the size.

## 4. Linearize the file

Linearization lets PDF viewers display the first page before the whole file is downloaded. Side effect: it often produces a tighter file structure.

## 5. Convert to image-first if appropriate

If your PDF is essentially a scanned document, sometimes the best move is to convert it to images first with [PDF to JPG](/tools/pdf-to-jpg), compress those, and rebuild a PDF. This is overkill for most cases but a lifesaver for huge scanned files.

The common thread: none of this requires an upload. Anything that can be done with a paid online compressor can be done locally in your browser — without the risk of your document touching a stranger's server.`,
  },
  {
    slug: "word-to-pdf-complete-guide",
    title: "Word to PDF and Back: The Complete Conversion Guide",
    excerpt:
      "Converting between PDF and Word seems simple, but small choices make a big difference in how the result looks. Here's what to know.",
    category: "Guides",
    readingTime: "7 min read",
    date: "April 14, 2026",
    author: "The Pdfica Team",
    hero: HERO_WORD,
    relatedTools: ["word-to-pdf", "pdf-to-word"],
    body: `Word and PDF are the two formats every office worker juggles. Word is great for editing; PDF is great for sharing. Converting between them — done well — is one of the highest-leverage skills you can have for getting documents into the right hands.

## Word → PDF: what you actually want

When you convert a Word document to PDF, you want three things:

1. Layout that survives. Headings, lists, and paragraph spacing should look the same as in Word.
2. Selectable text. The resulting PDF should be searchable, not a flat image.
3. A reasonable file size. Embedding the entire font set isn't always necessary.

Our [Word to PDF](/tools/word-to-pdf) tool runs the conversion entirely in your browser using Mammoth to parse the .docx and jsPDF to render it. The text is selectable, the layout is clean, and the file is shareable.

## PDF → Word: managing expectations

Going from PDF to Word is genuinely harder, because PDFs don't store paragraph structure — they store positioned text fragments. Any tool that claims to perfectly reconstruct your original Word document is lying.

Our [PDF to Word](/tools/pdf-to-word) tool extracts text per page and groups it into paragraphs based on vertical position. The result is editable text with reasonable paragraphing — great for further editing, but not a pixel-perfect reproduction of the original layout.

## The bigger picture

If you find yourself converting back and forth often, consider keeping the editable source (Word, Google Docs, Markdown) as the source of truth and only generating PDFs when you need to share. That avoids the lossy round-trip entirely.

Either way: there's no reason to upload sensitive documents to a third-party converter. Browser-based conversion is fast, free, and private.`,
  },
];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);

export type ToolCategory = "organize" | "optimize" | "convert" | "edit" | "security" | "image" | "document" | "generator" | "ai" | "calculator" | "web" | "business";

export interface Tool {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: ToolCategory;
  accept: string;
  multi: boolean;
  icon: string;
  to: string;
}

export const TOOLS: Tool[] = [
  // ORGANIZE
  { slug: "merge", name: "Merge PDF", tagline: "Combine PDFs in the order you want.", description: "Combine multiple PDF files into a single document in the exact order you choose.", category: "organize", accept: "application/pdf", multi: true, icon: "Layers", to: "/tools/merge" },
  { slug: "split", name: "Split PDF", tagline: "Extract pages or split into ranges.", description: "Pick page ranges to extract or split every page into its own PDF.", category: "organize", accept: "application/pdf", multi: false, icon: "Scissors", to: "/tools/split" },
  { slug: "organize", name: "Organize PDF", tagline: "Reorder, rotate and delete pages.", description: "Visually drag-and-drop pages, rotate any page, or remove pages before exporting.", category: "organize", accept: "application/pdf", multi: false, icon: "LayoutGrid", to: "/tools/organize" },
  { slug: "rotate", name: "Rotate PDF", tagline: "Rotate all or selected pages.", description: "Rotate every page or just the ranges you choose by 90, 180 or 270 degrees.", category: "organize", accept: "application/pdf", multi: false, icon: "RotateCw", to: "/tools/rotate" },
  { slug: "extract-pages", name: "Extract Pages", tagline: "Pull out specific pages.", description: "Save just the pages you need from a PDF into a brand new document.", category: "organize", accept: "application/pdf", multi: false, icon: "FileOutput", to: "/tools/extract-pages" },
  { slug: "remove-pages", name: "Remove Pages", tagline: "Delete pages from a PDF.", description: "Drop the page ranges you don't want and keep the rest.", category: "organize", accept: "application/pdf", multi: false, icon: "FileMinus", to: "/tools/remove-pages" },
  { slug: "n-up", name: "N-up PDF", tagline: "Multiple pages on one sheet.", description: "Print-friendly layout: place 2 or 4 source pages on every A4 sheet.", category: "organize", accept: "application/pdf", multi: false, icon: "Grid2x2", to: "/tools/n-up" },

  // OPTIMIZE
  { slug: "compress", name: "Compress PDF", tagline: "Reduce file size, keep great quality.", description: "Re-encode embedded images and strip metadata to shrink your PDF.", category: "optimize", accept: "application/pdf", multi: false, icon: "Minimize2", to: "/tools/compress" },
  { slug: "repair", name: "Repair PDF", tagline: "Fix broken or damaged PDFs.", description: "Best-effort in-browser rebuild for slightly corrupted PDF files.", category: "optimize", accept: "application/pdf", multi: false, icon: "Wrench", to: "/tools/repair" },
  { slug: "ocr", name: "OCR PDF", tagline: "Extract text from scanned PDFs.", description: "Run optical character recognition right in your browser — slower, but free and private.", category: "optimize", accept: "application/pdf", multi: false, icon: "ScanText", to: "/tools/ocr" },
  { slug: "pdf-to-pdfa", name: "PDF to PDF/A", tagline: "Archive-ready PDF format.", description: "Re-save your PDF with PDF/A friendly metadata and structure (best-effort).", category: "optimize", accept: "application/pdf", multi: false, icon: "Archive", to: "/tools/pdf-to-pdfa" },
  { slug: "grayscale-pdf", name: "Grayscale PDF", tagline: "Convert to black & white.", description: "Desaturate every page of a PDF for printing in monochrome.", category: "optimize", accept: "application/pdf", multi: false, icon: "Contrast", to: "/tools/grayscale-pdf" },
  { slug: "flatten-pdf", name: "Flatten PDF", tagline: "Rasterize every page.", description: "Flatten forms, annotations and layers by rasterizing each page.", category: "optimize", accept: "application/pdf", multi: false, icon: "Layers3", to: "/tools/flatten-pdf" },
  { slug: "pdf-metadata", name: "PDF Metadata", tagline: "View PDF info & properties.", description: "Inspect title, author, page count, creation date and other metadata.", category: "optimize", accept: "application/pdf", multi: false, icon: "Info", to: "/tools/pdf-metadata" },

  // CONVERT
  { slug: "pdf-to-word", name: "PDF to Word", tagline: "Convert PDFs into editable DOCX files.", description: "Extract text from your PDF and download a clean, editable Word document.", category: "convert", accept: "application/pdf", multi: false, icon: "FileType", to: "/tools/pdf-to-word" },
  { slug: "word-to-pdf", name: "Word to PDF", tagline: "Turn DOCX documents into PDFs.", description: "Upload a Word document and export a beautifully rendered PDF.", category: "convert", accept: "application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx", multi: false, icon: "FileText", to: "/tools/word-to-pdf" },
  { slug: "pdf-to-jpg", name: "PDF to JPG", tagline: "Export every page as a JPG image.", description: "Render each page of your PDF as a high-quality JPG and download them as a ZIP.", category: "convert", accept: "application/pdf", multi: false, icon: "Image", to: "/tools/pdf-to-jpg" },
  { slug: "jpg-to-pdf", name: "JPG to PDF", tagline: "Combine images into a clean PDF.", description: "Drop multiple JPG or PNG files and arrange them into a single PDF document.", category: "convert", accept: "image/jpeg,image/png,image/webp", multi: true, icon: "ImagePlus", to: "/tools/jpg-to-pdf" },
  { slug: "image-to-pdf", name: "Image to PDF", tagline: "Any images → one PDF.", description: "Drop JPG, PNG or WebP images and merge them into a single downloadable PDF.", category: "convert", accept: "image/jpeg,image/png,image/webp", multi: true, icon: "FileImage", to: "/tools/image-to-pdf" },
  { slug: "pdf-to-image", name: "PDF to Image", tagline: "Export pages as PNG, JPG or WebP.", description: "Render every page of a PDF as a high-quality image in your chosen format and download as ZIP.", category: "convert", accept: "application/pdf", multi: false, icon: "Images", to: "/tools/pdf-to-image" },
  { slug: "png-to-jpg", name: "PNG to JPG", tagline: "Convert PNG images to JPG.", description: "Convert PNG to a smaller, web-friendly JPG with a clean white background.", category: "convert", accept: "image/png", multi: false, icon: "Image", to: "/tools/png-to-jpg" },
  { slug: "jpg-to-png", name: "JPG to PNG", tagline: "Convert JPG images to PNG.", description: "Convert JPG or JPEG photos to lossless PNG instantly in your browser.", category: "convert", accept: "image/jpeg", multi: false, icon: "Image", to: "/tools/jpg-to-png" },
  { slug: "excel-to-pdf", name: "Excel to PDF", tagline: "Turn spreadsheets into PDFs.", description: "Convert .xlsx workbooks into a clean PDF, one sheet per page.", category: "convert", accept: ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", multi: false, icon: "Sheet", to: "/tools/excel-to-pdf" },
  { slug: "pdf-to-excel", name: "PDF to Excel", tagline: "Extract tables into a spreadsheet.", description: "Pull text content from your PDF into an .xlsx workbook, one sheet per page.", category: "convert", accept: "application/pdf", multi: false, icon: "Table", to: "/tools/pdf-to-excel" },
  { slug: "html-to-pdf", name: "HTML to PDF", tagline: "Paste HTML, get a PDF.", description: "Convert raw HTML or rich text into a downloadable PDF document.", category: "convert", accept: "*/*", multi: false, icon: "Code", to: "/tools/html-to-pdf" },
  { slug: "scan-to-pdf", name: "Scan to PDF", tagline: "Use your camera as a scanner.", description: "Capture document pages with your device camera and bundle them into a single PDF.", category: "convert", accept: "*/*", multi: false, icon: "Camera", to: "/tools/scan-to-pdf" },
  { slug: "pdf-to-text", name: "PDF to Text", tagline: "Get plain text from any PDF.", description: "Extract all text content from a PDF and download a clean .txt file.", category: "convert", accept: "application/pdf", multi: false, icon: "FileText", to: "/tools/pdf-to-text" },
  { slug: "text-to-pdf", name: "Text to PDF", tagline: "Paste text, download a PDF.", description: "Quickly turn any block of plain text into a downloadable PDF document.", category: "convert", accept: "*/*", multi: false, icon: "Type", to: "/tools/text-to-pdf" },
  { slug: "markdown-to-pdf", name: "Markdown to PDF", tagline: "Render Markdown to a PDF.", description: "Convert Markdown with headings, lists and paragraphs into a styled PDF.", category: "convert", accept: "*/*", multi: false, icon: "FileCode", to: "/tools/markdown-to-pdf" },

  // EDIT
  { slug: "edit", name: "Edit PDF", tagline: "Add text on top of any page.", description: "Place text annotations anywhere on a PDF page with full control over size and position.", category: "edit", accept: "application/pdf", multi: false, icon: "PenLine", to: "/tools/edit" },
  { slug: "sign", name: "Sign PDF", tagline: "Draw and place your signature.", description: "Sign with your mouse or finger and place the signature on the page of your choice.", category: "edit", accept: "application/pdf", multi: false, icon: "PenTool", to: "/tools/sign" },
  { slug: "watermark", name: "Watermark PDF", tagline: "Add a diagonal text watermark.", description: "Stamp every page with a text watermark — adjust opacity, size and angle.", category: "edit", accept: "application/pdf", multi: false, icon: "Stamp", to: "/tools/watermark" },
  { slug: "page-numbers", name: "Page Numbers", tagline: "Add page numbers to every page.", description: "Number every page with multiple position and format options.", category: "edit", accept: "application/pdf", multi: false, icon: "Hash", to: "/tools/page-numbers" },
  { slug: "crop", name: "Crop PDF", tagline: "Trim margins from every page.", description: "Apply a percentage-based margin crop to every page in the document.", category: "edit", accept: "application/pdf", multi: false, icon: "Crop", to: "/tools/crop" },
  { slug: "redact", name: "Redact PDF", tagline: "Black out sensitive areas.", description: "Cover sensitive content with opaque black rectangles before sharing.", category: "edit", accept: "application/pdf", multi: false, icon: "EyeOff", to: "/tools/redact" },

  // SECURITY
  { slug: "protect", name: "Protect PDF", tagline: "Add a password to your PDF.", description: "Encrypt your PDF with a password so only the right people can open it.", category: "security", accept: "application/pdf", multi: false, icon: "Lock", to: "/tools/protect" },
  { slug: "unlock", name: "Unlock PDF", tagline: "Remove password protection from PDFs.", description: "Strip the open-password from a PDF you own. The file never leaves your device.", category: "security", accept: "application/pdf", multi: false, icon: "Unlock", to: "/tools/unlock" },
  { slug: "compare", name: "Compare PDF", tagline: "See what changed between two PDFs.", description: "Run a side-by-side text diff between two PDFs and download the report.", category: "security", accept: "application/pdf", multi: true, icon: "GitCompare", to: "/tools/compare" },

  // IMAGE
  { slug: "image-compress", name: "Compress Image", tagline: "Shrink JPG and PNG images.", description: "Re-encode images with a quality slider to dramatically reduce file size.", category: "image", accept: "image/jpeg,image/png,image/webp", multi: false, icon: "Minimize2", to: "/tools/image-compress" },
  { slug: "image-resize", name: "Resize Image", tagline: "Set new width and height.", description: "Resize an image while keeping its aspect ratio, all in your browser.", category: "image", accept: "image/jpeg,image/png,image/webp", multi: false, icon: "Maximize2", to: "/tools/image-resize" },
  { slug: "image-convert", name: "Convert Image", tagline: "Switch between JPG, PNG, WebP.", description: "Convert an image between JPG, PNG and WebP formats instantly.", category: "image", accept: "image/jpeg,image/png,image/webp", multi: false, icon: "Replace", to: "/tools/image-convert" },
  { slug: "image-crop", name: "Crop Image", tagline: "Trim margins from an image.", description: "Apply a percentage-based margin crop to an image.", category: "image", accept: "image/jpeg,image/png,image/webp", multi: false, icon: "Crop", to: "/tools/image-crop" },
  { slug: "image-rotate", name: "Rotate Image", tagline: "Rotate 90, 180 or 270°.", description: "Rotate an image by a fixed angle and download the result.", category: "image", accept: "image/jpeg,image/png,image/webp", multi: false, icon: "RotateCw", to: "/tools/image-rotate" },
  { slug: "image-grayscale", name: "Grayscale Image", tagline: "Convert to black & white.", description: "Strip color from any image for a clean monochrome look.", category: "image", accept: "image/jpeg,image/png,image/webp", multi: false, icon: "Contrast", to: "/tools/image-grayscale" },
  { slug: "remove-exif", name: "Remove EXIF Data", tagline: "Strip image metadata.", description: "Remove GPS, camera and other EXIF metadata from images before sharing.", category: "image", accept: "image/jpeg,image/png,image/webp", multi: false, icon: "Eraser", to: "/tools/remove-exif" },

  // DOCUMENT / DATA
  { slug: "csv-to-excel", name: "CSV to Excel", tagline: "Convert CSV to .xlsx.", description: "Upload a CSV file and download it as an Excel workbook.", category: "document", accept: ".csv,text/csv", multi: false, icon: "FileSpreadsheet", to: "/tools/csv-to-excel" },
  { slug: "excel-to-csv", name: "Excel to CSV", tagline: "Convert .xlsx to CSV.", description: "Export the first sheet of an Excel file to a CSV download.", category: "document", accept: ".xlsx,.xls", multi: false, icon: "FileSpreadsheet", to: "/tools/excel-to-csv" },
  { slug: "csv-to-json", name: "CSV to JSON", tagline: "Convert CSV rows to JSON.", description: "Parse a CSV file and download an array of JSON objects.", category: "document", accept: ".csv,text/csv", multi: false, icon: "Braces", to: "/tools/csv-to-json" },
  { slug: "json-to-csv", name: "JSON to CSV", tagline: "Flatten a JSON array to CSV.", description: "Upload a JSON array of objects and download it as a CSV file.", category: "document", accept: ".json,application/json", multi: false, icon: "Braces", to: "/tools/json-to-csv" },
  { slug: "json-formatter", name: "JSON Formatter", tagline: "Pretty-print JSON.", description: "Paste any JSON and reformat it with clean indentation.", category: "document", accept: "*/*", multi: false, icon: "Braces", to: "/tools/json-formatter" },

  // GENERATORS / UTILITIES
  { slug: "qr-generator", name: "QR Code Generator", tagline: "Create QR codes from text or URLs.", description: "Generate a high-resolution PNG QR code for any link or string.", category: "generator", accept: "*/*", multi: false, icon: "QrCode", to: "/tools/qr-generator" },
  { slug: "password-generator", name: "Password Generator", tagline: "Strong, random passwords.", description: "Generate cryptographically random passwords with custom rules.", category: "generator", accept: "*/*", multi: false, icon: "KeyRound", to: "/tools/password-generator" },
  { slug: "lorem-ipsum", name: "Lorem Ipsum", tagline: "Placeholder text generator.", description: "Generate paragraphs of Lorem Ipsum filler text for your designs.", category: "generator", accept: "*/*", multi: false, icon: "Quote", to: "/tools/lorem-ipsum" },
  { slug: "word-counter", name: "Word Counter", tagline: "Count words, characters & more.", description: "Get instant statistics for any block of text — words, characters, reading time.", category: "generator", accept: "*/*", multi: false, icon: "Calculator", to: "/tools/word-counter" },
  { slug: "case-converter", name: "Case Converter", tagline: "UPPER, lower, Title, camelCase…", description: "Convert text between multiple letter cases instantly.", category: "generator", accept: "*/*", multi: false, icon: "CaseSensitive", to: "/tools/case-converter" },
  { slug: "base64", name: "Base64 Encode/Decode", tagline: "Encode or decode Base64.", description: "Encode any text to Base64 or decode a Base64 string back to plain text.", category: "generator", accept: "*/*", multi: false, icon: "Binary", to: "/tools/base64" },
  { slug: "url-encoder", name: "URL Encoder", tagline: "Encode or decode URLs.", description: "Percent-encode or decode strings for use in URLs and query parameters.", category: "generator", accept: "*/*", multi: false, icon: "Link2", to: "/tools/url-encoder" },
  { slug: "hash-generator", name: "Hash Generator", tagline: "SHA-1, SHA-256, SHA-512.", description: "Compute cryptographic hashes of text using the Web Crypto API.", category: "generator", accept: "*/*", multi: false, icon: "Fingerprint", to: "/tools/hash-generator" },

  // AI TOOLS (trending 2026, no API)
  { slug: "ai-summarizer", name: "AI Text Summarizer", tagline: "Summarize long text instantly.", description: "Extractive summarization that picks the most important sentences from any article or document.", category: "ai", accept: "*/*", multi: false, icon: "Sparkles", to: "/tools/ai-summarizer" },
  { slug: "text-to-speech", name: "Text to Speech", tagline: "Listen to any text.", description: "Convert text into natural speech using your browser's built-in voices. No upload needed.", category: "ai", accept: "*/*", multi: false, icon: "Volume2", to: "/tools/text-to-speech" },
  { slug: "image-to-base64", name: "Image to Base64", tagline: "Convert images to data URIs.", description: "Drop an image and instantly get a Base64 data URI for inlining in HTML, CSS or JSON.", category: "ai", accept: "image/*", multi: false, icon: "Binary", to: "/tools/image-to-base64" },
  { slug: "yt-thumbnail", name: "YouTube Thumbnail", tagline: "Download any video's thumbnail.", description: "Paste a YouTube URL and download the maximum-resolution thumbnail in one click.", category: "ai", accept: "*/*", multi: false, icon: "Youtube", to: "/tools/yt-thumbnail" },

  // BUSINESS
  { slug: "invoice-generator", name: "Invoice Generator", tagline: "Free professional invoices.", description: "Fill out the form, preview, and download a clean PDF invoice for your clients.", category: "business", accept: "*/*", multi: false, icon: "FileSpreadsheet", to: "/tools/invoice-generator" },
  { slug: "resume-builder", name: "Resume Builder", tagline: "Build a PDF resume in minutes.", description: "Fill in your experience and download a clean ATS-friendly PDF resume.", category: "business", accept: "*/*", multi: false, icon: "FileBadge", to: "/tools/resume-builder" },

  // CALCULATORS
  { slug: "age-calculator", name: "Age Calculator", tagline: "Years, months and days.", description: "Calculate your exact age in years, months, days, hours, and minutes from your date of birth.", category: "calculator", accept: "*/*", multi: false, icon: "Cake", to: "/tools/age-calculator" },
  { slug: "bmi-calculator", name: "BMI Calculator", tagline: "Body mass index in seconds.", description: "Compute your BMI and see which category you fall into using metric or imperial units.", category: "calculator", accept: "*/*", multi: false, icon: "Activity", to: "/tools/bmi-calculator" },
  { slug: "emi-calculator", name: "EMI / Loan Calculator", tagline: "Monthly loan payments.", description: "Calculate monthly EMI, total interest and full amortization for any loan.", category: "calculator", accept: "*/*", multi: false, icon: "Landmark", to: "/tools/emi-calculator" },
  { slug: "tip-calculator", name: "Tip Calculator", tagline: "Split bills and tips.", description: "Quickly calculate tip amounts and split the bill between any number of people.", category: "calculator", accept: "*/*", multi: false, icon: "Receipt", to: "/tools/tip-calculator" },
  { slug: "percentage-calculator", name: "Percentage Calculator", tagline: "Percentages, increases, decreases.", description: "Three calculators in one: what is X% of Y, X is what % of Y, and percent change.", category: "calculator", accept: "*/*", multi: false, icon: "Percent", to: "/tools/percentage-calculator" },

  // WEB & DEV
  { slug: "regex-tester", name: "Regex Tester", tagline: "Test patterns live.", description: "Test JavaScript regex patterns against any input with live match highlighting.", category: "web", accept: "*/*", multi: false, icon: "Regex", to: "/tools/regex-tester" },
  { slug: "jwt-decoder", name: "JWT Decoder", tagline: "Inspect any JWT.", description: "Decode the header and payload of any JWT token instantly. Tokens never leave your browser.", category: "web", accept: "*/*", multi: false, icon: "KeyRound", to: "/tools/jwt-decoder" },
  { slug: "uuid-generator", name: "UUID Generator", tagline: "Generate v4 UUIDs.", description: "Generate one or many cryptographically-random v4 UUIDs in one click.", category: "web", accept: "*/*", multi: false, icon: "Hash", to: "/tools/uuid-generator" },
  { slug: "timestamp-converter", name: "Timestamp Converter", tagline: "Unix ↔ human date.", description: "Convert between Unix timestamps and human-readable dates in your local time zone.", category: "web", accept: "*/*", multi: false, icon: "Clock", to: "/tools/timestamp-converter" },
  { slug: "meta-tag-generator", name: "Meta Tag Generator", tagline: "SEO + Open Graph tags.", description: "Generate ready-to-paste meta tags for SEO, Twitter cards and Open Graph previews.", category: "web", accept: "*/*", multi: false, icon: "Tags", to: "/tools/meta-tag-generator" },
  { slug: "color-picker", name: "Color Picker from Image", tagline: "Click any pixel for its color.", description: "Drop an image, click anywhere on it and copy the HEX, RGB or HSL value instantly.", category: "web", accept: "image/*", multi: false, icon: "Pipette", to: "/tools/color-picker" },
];

export const CATEGORIES: Record<ToolCategory, { label: string; description: string; tone: string }> = {
  organize: { label: "Organize PDF", description: "Merge, split, and arrange pages", tone: "text-tool-organize" },
  optimize: { label: "Optimize PDF", description: "Compress, repair, and OCR", tone: "text-tool-optimize" },
  convert: { label: "Convert PDF", description: "Between PDF, Word, Excel, images", tone: "text-tool-convert" },
  edit: { label: "Edit PDF", description: "Annotate, sign, watermark, crop", tone: "text-tool-organize" },
  security: { label: "Security", description: "Protect, unlock and compare", tone: "text-tool-security" },
  image: { label: "Image Tools", description: "Compress, convert, resize, clean", tone: "text-tool-convert" },
  document: { label: "Documents & Data", description: "CSV, JSON, Excel, Markdown", tone: "text-tool-optimize" },
  generator: { label: "Generators", description: "QR, passwords, hashes, text", tone: "text-tool-security" },
  ai: { label: "AI & Media", description: "Summarize, speak, download media", tone: "text-tool-convert" },
  business: { label: "Business", description: "Invoices, resumes and more", tone: "text-tool-organize" },
  calculator: { label: "Calculators", description: "Finance, health and math", tone: "text-tool-optimize" },
  web: { label: "Web & Dev", description: "Regex, JWT, SEO, dev utilities", tone: "text-tool-security" },
};

export const toolsByCategory = (): Record<ToolCategory, Tool[]> => {
  const out = { organize: [], optimize: [], convert: [], edit: [], security: [], image: [], document: [], generator: [], ai: [], business: [], calculator: [], web: [] } as Record<ToolCategory, Tool[]>;
  for (const t of TOOLS) out[t.category].push(t);
  return out;
};

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug);

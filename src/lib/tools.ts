export type ToolCategory = "organize" | "optimize" | "convert" | "edit" | "security";

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

  // OPTIMIZE
  { slug: "compress", name: "Compress PDF", tagline: "Reduce file size, keep great quality.", description: "Re-encode embedded images and strip metadata to shrink your PDF.", category: "optimize", accept: "application/pdf", multi: false, icon: "Minimize2", to: "/tools/compress" },
  { slug: "repair", name: "Repair PDF", tagline: "Fix broken or damaged PDFs.", description: "Best-effort in-browser rebuild for slightly corrupted PDF files.", category: "optimize", accept: "application/pdf", multi: false, icon: "Wrench", to: "/tools/repair" },
  { slug: "ocr", name: "OCR PDF", tagline: "Extract text from scanned PDFs.", description: "Run optical character recognition right in your browser — slower, but free and private.", category: "optimize", accept: "application/pdf", multi: false, icon: "ScanText", to: "/tools/ocr" },
  { slug: "pdf-to-pdfa", name: "PDF to PDF/A", tagline: "Archive-ready PDF format.", description: "Re-save your PDF with PDF/A friendly metadata and structure (best-effort).", category: "optimize", accept: "application/pdf", multi: false, icon: "Archive", to: "/tools/pdf-to-pdfa" },

  // CONVERT
  { slug: "pdf-to-word", name: "PDF to Word", tagline: "Convert PDFs into editable DOCX files.", description: "Extract text from your PDF and download a clean, editable Word document.", category: "convert", accept: "application/pdf", multi: false, icon: "FileType", to: "/tools/pdf-to-word" },
  { slug: "word-to-pdf", name: "Word to PDF", tagline: "Turn DOCX documents into PDFs.", description: "Upload a Word document and export a beautifully rendered PDF.", category: "convert", accept: "application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx", multi: false, icon: "FileText", to: "/tools/word-to-pdf" },
  { slug: "pdf-to-jpg", name: "PDF to JPG", tagline: "Export every page as a JPG image.", description: "Render each page of your PDF as a high-quality JPG and download them as a ZIP.", category: "convert", accept: "application/pdf", multi: false, icon: "Image", to: "/tools/pdf-to-jpg" },
  { slug: "jpg-to-pdf", name: "JPG to PDF", tagline: "Combine images into a clean PDF.", description: "Drop multiple JPG or PNG files and arrange them into a single PDF document.", category: "convert", accept: "image/jpeg,image/png,image/webp", multi: true, icon: "ImagePlus", to: "/tools/jpg-to-pdf" },
  { slug: "excel-to-pdf", name: "Excel to PDF", tagline: "Turn spreadsheets into PDFs.", description: "Convert .xlsx workbooks into a clean PDF, one sheet per page.", category: "convert", accept: ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", multi: false, icon: "Sheet", to: "/tools/excel-to-pdf" },
  { slug: "pdf-to-excel", name: "PDF to Excel", tagline: "Extract tables into a spreadsheet.", description: "Pull text content from your PDF into an .xlsx workbook, one sheet per page.", category: "convert", accept: "application/pdf", multi: false, icon: "Table", to: "/tools/pdf-to-excel" },
  { slug: "html-to-pdf", name: "HTML to PDF", tagline: "Paste HTML, get a PDF.", description: "Convert raw HTML or rich text into a downloadable PDF document.", category: "convert", accept: "*/*", multi: false, icon: "Code", to: "/tools/html-to-pdf" },
  { slug: "scan-to-pdf", name: "Scan to PDF", tagline: "Use your camera as a scanner.", description: "Capture document pages with your device camera and bundle them into a single PDF.", category: "convert", accept: "*/*", multi: false, icon: "Camera", to: "/tools/scan-to-pdf" },

  // EDIT
  { slug: "edit", name: "Edit PDF", tagline: "Add text on top of any page.", description: "Place text annotations anywhere on a PDF page with full control over size and position.", category: "edit", accept: "application/pdf", multi: false, icon: "PenLine", to: "/tools/edit" },
  { slug: "sign", name: "Sign PDF", tagline: "Draw and place your signature.", description: "Sign with your mouse or finger and place the signature on the page of your choice.", category: "edit", accept: "application/pdf", multi: false, icon: "Signature", to: "/tools/sign" },
  { slug: "watermark", name: "Watermark PDF", tagline: "Add a diagonal text watermark.", description: "Stamp every page with a text watermark — adjust opacity, size and angle.", category: "edit", accept: "application/pdf", multi: false, icon: "Stamp", to: "/tools/watermark" },
  { slug: "page-numbers", name: "Page Numbers", tagline: "Add page numbers to every page.", description: "Number every page with multiple position and format options.", category: "edit", accept: "application/pdf", multi: false, icon: "Hash", to: "/tools/page-numbers" },
  { slug: "crop", name: "Crop PDF", tagline: "Trim margins from every page.", description: "Apply a percentage-based margin crop to every page in the document.", category: "edit", accept: "application/pdf", multi: false, icon: "Crop", to: "/tools/crop" },
  { slug: "redact", name: "Redact PDF", tagline: "Black out sensitive areas.", description: "Cover sensitive content with opaque black rectangles before sharing.", category: "edit", accept: "application/pdf", multi: false, icon: "EyeOff", to: "/tools/redact" },

  // SECURITY
  { slug: "protect", name: "Protect PDF", tagline: "Add a password to your PDF.", description: "Encrypt your PDF with a password so only the right people can open it.", category: "security", accept: "application/pdf", multi: false, icon: "Lock", to: "/tools/protect" },
  { slug: "unlock", name: "Unlock PDF", tagline: "Remove password protection from PDFs.", description: "Strip the open-password from a PDF you own. The file never leaves your device.", category: "security", accept: "application/pdf", multi: false, icon: "Unlock", to: "/tools/unlock" },
  { slug: "compare", name: "Compare PDF", tagline: "See what changed between two PDFs.", description: "Run a side-by-side text diff between two PDFs and download the report.", category: "security", accept: "application/pdf", multi: true, icon: "GitCompare", to: "/tools/compare" },
];

export const CATEGORIES: Record<ToolCategory, { label: string; description: string; tone: string }> = {
  organize: { label: "Organize", description: "Merge, split, and arrange pages", tone: "text-tool-organize" },
  optimize: { label: "Optimize", description: "Compress, repair, and OCR", tone: "text-tool-optimize" },
  convert: { label: "Convert", description: "Between PDF, Word, Excel, images and more", tone: "text-tool-convert" },
  edit: { label: "Edit", description: "Annotate, sign, watermark, redact and crop", tone: "text-tool-organize" },
  security: { label: "Security", description: "Protect, unlock and compare documents", tone: "text-tool-security" },
};

export const toolsByCategory = (): Record<ToolCategory, Tool[]> => {
  const out = { organize: [], optimize: [], convert: [], edit: [], security: [] } as Record<ToolCategory, Tool[]>;
  for (const t of TOOLS) out[t.category].push(t);
  return out;
};

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug);

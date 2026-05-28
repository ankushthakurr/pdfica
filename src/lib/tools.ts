export type ToolCategory = "organize" | "optimize" | "convert" | "security";

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
  {
    slug: "merge",
    name: "Merge PDF",
    tagline: "Combine PDFs in the order you want.",
    description:
      "Combine multiple PDF files into a single document in the exact order you choose. Drag to reorder before merging.",
    category: "organize",
    accept: "application/pdf",
    multi: true,
    icon: "Layers",
    to: "/tools/merge",
  },
  {
    slug: "split",
    name: "Split PDF",
    tagline: "Extract pages or split into ranges.",
    description: "Pick page ranges to extract or split every page into its own PDF.",
    category: "organize",
    accept: "application/pdf",
    multi: false,
    icon: "Scissors",
    to: "/tools/split",
  },
  {
    slug: "organize",
    name: "Organize PDF",
    tagline: "Reorder, rotate and delete pages.",
    description: "Visually drag-and-drop pages, rotate any page, or remove pages before exporting.",
    category: "organize",
    accept: "application/pdf",
    multi: false,
    icon: "LayoutGrid",
    to: "/tools/organize",
  },
  {
    slug: "compress",
    name: "Compress PDF",
    tagline: "Reduce file size, keep great quality.",
    description: "Re-encode embedded images and strip metadata to shrink your PDF.",
    category: "optimize",
    accept: "application/pdf",
    multi: false,
    icon: "Minimize2",
    to: "/tools/compress",
  },
  {
    slug: "pdf-to-word",
    name: "PDF to Word",
    tagline: "Convert PDFs into editable DOCX files.",
    description: "Extract text from your PDF and download a clean, editable Word document.",
    category: "convert",
    accept: "application/pdf",
    multi: false,
    icon: "FileType",
    to: "/tools/pdf-to-word",
  },
  {
    slug: "word-to-pdf",
    name: "Word to PDF",
    tagline: "Turn DOCX documents into polished PDFs.",
    description: "Upload a Word document and export a beautifully rendered PDF.",
    category: "convert",
    accept:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx",
    multi: false,
    icon: "FileText",
    to: "/tools/word-to-pdf",
  },
  {
    slug: "pdf-to-jpg",
    name: "PDF to JPG",
    tagline: "Export every page as a JPG image.",
    description: "Render each page of your PDF as a high-quality JPG and download them as a ZIP.",
    category: "convert",
    accept: "application/pdf",
    multi: false,
    icon: "Image",
    to: "/tools/pdf-to-jpg",
  },
  {
    slug: "jpg-to-pdf",
    name: "JPG to PDF",
    tagline: "Combine images into a clean PDF.",
    description: "Drop multiple JPG or PNG files and arrange them into a single PDF document.",
    category: "convert",
    accept: "image/jpeg,image/png,image/webp",
    multi: true,
    icon: "ImagePlus",
    to: "/tools/jpg-to-pdf",
  },
  {
    slug: "protect",
    name: "Protect PDF",
    tagline: "Add a password to your PDF.",
    description: "Encrypt your PDF with a password so only the right people can open it.",
    category: "security",
    accept: "application/pdf",
    multi: false,
    icon: "Lock",
    to: "/tools/protect",
  },
  {
    slug: "unlock",
    name: "Unlock PDF",
    tagline: "Remove password protection from PDFs.",
    description: "Strip the open-password from a PDF you own. The file never leaves your device.",
    category: "security",
    accept: "application/pdf",
    multi: false,
    icon: "Unlock",
    to: "/tools/unlock",
  },
];

export const CATEGORIES: Record<
  ToolCategory,
  { label: string; description: string; tone: string }
> = {
  organize: {
    label: "Organize",
    description: "Merge, split, and arrange pages",
    tone: "text-tool-organize",
  },
  optimize: {
    label: "Optimize",
    description: "Compress and clean up files",
    tone: "text-tool-optimize",
  },
  convert: {
    label: "Convert",
    description: "Between PDF, Word, and images",
    tone: "text-tool-convert",
  },
  security: {
    label: "Security",
    description: "Protect or unlock documents",
    tone: "text-tool-security",
  },
};

export const toolsByCategory = (): Record<ToolCategory, Tool[]> => {
  const out = { organize: [], optimize: [], convert: [], security: [] } as Record<
    ToolCategory,
    Tool[]
  >;
  for (const t of TOOLS) out[t.category].push(t);
  return out;
};

export const getTool = (slug: string) => TOOLS.find((t) => t.slug === slug);

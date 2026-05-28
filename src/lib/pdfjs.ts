// Centralized pdfjs setup with bundled worker (no CDN).
import * as pdfjsLib from "pdfjs-dist";
// eslint-disable-next-line import/no-unresolved
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
}

export { pdfjsLib };

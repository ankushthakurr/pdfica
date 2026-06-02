// Lazy, browser-only pdfjs loader. Importing pdfjs-dist at module scope
// breaks SSR (DOMMatrix is not defined), so we defer it until first use
// from a real browser context.
type PdfJs = typeof import("pdfjs-dist");
let promise: Promise<PdfJs> | null = null;

export function loadPdfjs(): Promise<PdfJs> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("pdfjs can only be used in the browser"));
  }
  if (!promise) {
    promise = (async () => {
      const lib = await import("pdfjs-dist");
      const workerMod = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
      lib.GlobalWorkerOptions.workerSrc = workerMod.default;
      return lib;
    })();
  }
  return promise;
}

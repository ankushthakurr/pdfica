export type OutputFile = { blob: Blob; filename: string };
export type BatchReport = (index: number, phase: string, pct?: number) => void;

export async function convertSequentially(
  files: File[],
  convert: (file: File, report: BatchReport) => Promise<OutputFile | null>,
  report: BatchReport,
) {
  const outputs: OutputFile[] = [];
  const errors: string[] = [];
  for (let i = 0; i < files.length; i++) {
    report(i, "Reading", 5);
    // Yield before each conversion so queued and active states can paint.
    await new Promise((resolve) => setTimeout(resolve, 0));
    try {
      report(i, "Converting", 15);
      const result = await convert(files[i], (_, phase, pct) => report(i, phase, pct));
      if (result) outputs.push(result);
      report(i, "Done", 100);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Conversion failed.";
      errors.push(`${files[i].name}: ${message}`);
      report(i, "Failed", 0);
    }
  }
  return { outputs, errors };
}

export async function prepareArchive(outputs: OutputFile[]): Promise<OutputFile | null> {
  if (!outputs.length) return null;
  if (outputs.length === 1) return outputs[0];
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  outputs.forEach((output, i) => zip.file(`${String(i + 1).padStart(3, "0")}-${output.filename.replace(/[\\/]/g, "_")}`, output.blob));
  return { blob: await zip.generateAsync({ type: "blob", compression: "STORE" }), filename: "pdfica-results.zip" };
}
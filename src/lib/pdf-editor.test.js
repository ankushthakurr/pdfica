import { expect, test } from "bun:test";
import { PDFDocument } from "pdf-lib";
import { exportEditorPdf } from "./pdf-editor";

test("saving without edits preserves every page and its size", async () => {
  const input = await PDFDocument.create();
  input.addPage([300, 400]); input.addPage([500, 600]);
  const file = new File([await input.save()], "source.pdf");
  const result = await exportEditorPdf(file, {}, {}, () => {});
  const output = await PDFDocument.load(await result.arrayBuffer());
  expect(output.getPageCount()).toBe(2);
  expect(output.getPage(0).getSize()).toEqual({ width: 300, height: 400 });
  expect(output.getPage(1).getSize()).toEqual({ width: 500, height: 600 });
});

test("export refuses an edit on a page that has not loaded", async () => {
  const input = await PDFDocument.create(); input.addPage();
  const file = new File([await input.save()], "source.pdf");
  await expect(exportEditorPdf(file, {}, { 1: { text: { text: "Rewritten", fontSize: 14, bold: false, color: "#171717" } } }, () => {})).rejects.toThrow("Page 1 is not ready");
});
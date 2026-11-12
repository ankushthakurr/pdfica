import { describe, expect, test } from "bun:test";
import { convertSequentially } from "./batch";

describe("batch conversions", () => {
  test("converts at least ten selected files in order without overlapping", async () => {
    const files = Array.from({ length: 10 }, (_, i) => new File([String(i)], `${i}.txt`));
    let active = 0;
    let peak = 0;
    const order = [];
    const result = await convertSequentially(files, async (file) => {
      active++; peak = Math.max(peak, active); order.push(file.name);
      await new Promise((resolve) => setTimeout(resolve, 1));
      active--;
      return { blob: new Blob([await file.text()]), filename: file.name };
    }, () => {});
    expect(result.outputs.length).toBe(10);
    expect(order).toEqual(files.map((file) => file.name));
    expect(peak).toBe(1);
  });
  test("continues after a failed file and keeps successful downloads", async () => {
    const phases = [];
    const result = await convertSequentially([new File(["bad"], "bad.pdf"), new File(["good"], "good.pdf")], async (file) => {
      if (file.name === "bad.pdf") throw new Error("Unreadable PDF");
      return { blob: new Blob(["good"]), filename: "good.txt" };
    }, (i, phase) => phases.push(`${i}:${phase}`));
    expect(result.errors).toEqual(["bad.pdf: Unreadable PDF"]);
    expect(result.outputs.map((file) => file.filename)).toEqual(["good.txt"]);
    expect(phases).toContain("0:Failed");
    expect(phases).toContain("1:Done");
  });
});
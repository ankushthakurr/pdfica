// Browser-only image utilities. All operations run on the user's device.

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read the image."));
    };
    img.src = url;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> =>
  new Promise((res, rej) =>
    canvas.toBlob(
      (b) => (b ? res(b) : rej(new Error("Failed to encode image."))),
      type,
      quality,
    ),
  );

const drawTo = (img: HTMLImageElement, w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c;
};

export async function compressImage(file: File, quality = 0.7): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = drawTo(img, img.naturalWidth, img.naturalHeight);
  return canvasToBlob(canvas, "image/jpeg", quality);
}

export async function resizeImage(file: File, maxW: number, maxH: number): Promise<Blob> {
  const img = await loadImage(file);
  const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
  const canvas = drawTo(img, img.naturalWidth * scale, img.naturalHeight * scale);
  return canvasToBlob(canvas, file.type === "image/png" ? "image/png" : "image/jpeg", 0.92);
}

export async function convertImage(
  file: File,
  target: "image/jpeg" | "image/png" | "image/webp",
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = drawTo(img, img.naturalWidth, img.naturalHeight);
  return canvasToBlob(canvas, target, 0.92);
}

export async function cropImage(file: File, marginPct: number): Promise<Blob> {
  const img = await loadImage(file);
  const dx = (img.naturalWidth * marginPct) / 100;
  const dy = (img.naturalHeight * marginPct) / 100;
  const w = img.naturalWidth - dx * 2;
  const h = img.naturalHeight - dy * 2;
  const c = document.createElement("canvas");
  c.width = Math.max(1, w);
  c.height = Math.max(1, h);
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, dx, dy, w, h, 0, 0, w, h);
  return canvasToBlob(c, file.type === "image/png" ? "image/png" : "image/jpeg", 0.92);
}

export async function rotateImage(file: File, angle: 90 | 180 | 270): Promise<Blob> {
  const img = await loadImage(file);
  const rad = (angle * Math.PI) / 180;
  const swap = angle === 90 || angle === 270;
  const w = swap ? img.naturalHeight : img.naturalWidth;
  const h = swap ? img.naturalWidth : img.naturalHeight;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.translate(w / 2, h / 2);
  ctx.rotate(rad);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  return canvasToBlob(c, file.type === "image/png" ? "image/png" : "image/jpeg", 0.95);
}

// Re-encoding through canvas strips all EXIF / metadata.
export async function removeExif(file: File): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = drawTo(img, img.naturalWidth, img.naturalHeight);
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  return canvasToBlob(canvas, type, 0.95);
}

export async function grayscaleImage(file: File): Promise<Blob> {
  const img = await loadImage(file);
  const c = drawTo(img, img.naturalWidth, img.naturalHeight);
  const ctx = c.getContext("2d")!;
  const data = ctx.getImageData(0, 0, c.width, c.height);
  for (let i = 0; i < data.data.length; i += 4) {
    const g = data.data[i] * 0.299 + data.data[i + 1] * 0.587 + data.data[i + 2] * 0.114;
    data.data[i] = data.data[i + 1] = data.data[i + 2] = g;
  }
  ctx.putImageData(data, 0, 0);
  return canvasToBlob(c, file.type === "image/png" ? "image/png" : "image/jpeg", 0.92);
}

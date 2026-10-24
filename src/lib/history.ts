import type { ScanRecord } from "./scan-types";

let KEY = "scrapsense.history.signed-out";
export function setHistoryOwner(id: string | null) { KEY = `scrapsense.history.v2.${id ?? "signed-out"}`; }
const MAX = 20;

export function loadHistory(): ScanRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function save(list: ScanRecord[]) {
  let l = list.slice(0, MAX);
  while (l.length) {
    try {
      localStorage.setItem(KEY, JSON.stringify(l));
      return;
    } catch {
      l = l.slice(0, -1); // quota: drop oldest
    }
  }
  localStorage.removeItem(KEY);
}

export function addScan(r: ScanRecord) {
  save([r, ...loadHistory().filter((x) => x.id !== r.id)]);
}
export function removeScan(id: string) {
  save(loadHistory().filter((x) => x.id !== id));
}
export function clearHistory() {
  localStorage.removeItem(KEY);
}
export function getScan(id: string) {
  return loadHistory().find((x) => x.id === id);
}

/** Resize an image source to a JPEG data URL. */
export async function toJpegDataUrl(src: string, maxDim: number, quality = 0.85): Promise<string> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error("Could not read that image."));
    img.src = src;
  });
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Image processing unavailable.");
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", quality);
}

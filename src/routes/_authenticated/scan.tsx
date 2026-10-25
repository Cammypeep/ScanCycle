import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Upload, Camera, Sparkles, RotateCcw, X, AlertCircle, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ResultView } from "@/components/ResultView";
import { analyzeImage } from "@/lib/analyze.functions";
import { addScan, loadHistory, toJpegDataUrl } from "@/lib/history";
import { BIN_SWATCH, type Analysis, type ScanRecord } from "@/lib/scan-types";
import { cn } from "@/lib/utils";
import sampleCan from "@/assets/sample-can.jpg";
import sampleSteel from "@/assets/sample-steel.jpg";
import sampleBottle from "@/assets/sample-bottle.jpg";

export const Route = createFileRoute("/_authenticated/scan")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "AI Scanner — ScrapSense" },
      { name: "description", content: "Upload or snap a photo and let AI identify the material and how to recycle it." },
      { property: "og:title", content: "AI Scanner — ScrapSense" },
      { property: "og:description", content: "Identify recyclable materials from a photo in seconds." },
    ],
  }),
  component: ScanPage,
});

const SAMPLES = [
  { src: sampleCan, label: "Aluminum can" },
  { src: sampleSteel, label: "Steel tin & wrench" },
  { src: sampleBottle, label: "Plastic bottle" },
];
const MAX_BYTES = 15 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

function ScanPage() {
  const analyze = useServerFn(analyzeImage);
  const fileRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ msg: string; retryable: boolean } | null>(null);
  const [result, setResult] = useState<Analysis | null>(null);

  async function loadSource(src: string) {
    setError(null);
    setResult(null);
    try {
      setPreview(await toJpegDataUrl(src, 1280));
    } catch (e) {
      setError({ msg: (e as Error).message, retryable: false });
    }
  }

  function handleFile(f?: File | null) {
    if (!f) return;
    if (!TYPES.includes(f.type) && !f.type.startsWith("image/")) {
      toast.error("Unsupported file type. Please use JPG, PNG or WEBP.");
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error("That image is over 15 MB. Please choose a smaller one.");
      return;
    }
    const url = URL.createObjectURL(f);
    loadSource(url).finally(() => URL.revokeObjectURL(url));
  }

  async function run() {
    if (!preview) return;
    setLoading(true);
    setError(null);
    try {
      const r = await analyze({ data: { image: preview } });
      if (!r.ok) {
        setError({ msg: r.error, retryable: r.retryable });
        return;
      }
      setResult(r.analysis);
      const thumb = await toJpegDataUrl(preview, 480, 0.7);
      addScan({ id: crypto.randomUUID(), createdAt: Date.now(), image: thumb, analysis: r.analysis });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError({ msg: (e as Error).message || "Something went wrong.", retryable: true });
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setPreview(null);
    setResult(null);
    setError(null);
  }

  if (result && preview) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Analysis complete · AI vision</p>
            <h1 className="text-2xl font-bold">Your scan results</h1>
          </div>
          <Button variant="hero" size="lg" onClick={reset}><RotateCcw className="h-4 w-4" /> Scan Another Object</Button>
        </div>
        <ResultView image={preview} analysis={result} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-primary">AI Scanner</p>
      <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Which Bin Should This Go?</h1>
      <p className="mt-2 text-muted-foreground">Upload a clear photo of a single object for the best results.</p>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
      <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />

      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files?.[0]); }}
        className={cn(
          "glass relative mt-8 overflow-hidden rounded-3xl border-2 border-dashed transition-all",
          drag ? "border-primary bg-accent/40" : "border-border",
        )}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Selected object" className="max-h-[480px] w-full object-contain" />
            {loading && (
              <div className="absolute inset-0 bg-background/40">
                <div className="animate-scan absolute inset-x-0 h-1 bg-emerald shadow-glow" />
                <div className="absolute inset-0 grid-lines" />
              </div>
            )}
            {!loading && (
              <button onClick={reset} aria-label="Remove image" className="glass absolute right-3 top-3 rounded-full p-2 hover:bg-secondary">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-accent text-accent-foreground">
              <ImageIcon className="h-8 w-8" />
            </span>
            <p className="mt-5 text-lg font-semibold">Drag &amp; drop a photo here</p>
            <p className="mt-1 text-sm text-muted-foreground">JPG, PNG or WEBP · up to 15 MB</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button variant="hero" size="lg" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Choose file</Button>
              <Button variant="glass" size="lg" onClick={() => camRef.current?.click()}><Camera className="h-4 w-4" /> Take photo</Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <span className="flex-1">{error.msg}</span>
          {error.retryable && preview && <Button size="sm" variant="outline" onClick={run}>Retry</Button>}
        </div>
      )}

      {preview && (
        <Button variant="hero" size="xl" className="mt-6 w-full" disabled={loading} onClick={run}>
          {loading ? (<><Sparkles className="h-5 w-5 animate-pulse" /> Analyzing material…</>) : (<><Sparkles className="h-5 w-5" /> Analyze Material</>)}
        </Button>
      )}

      <div className="mt-12">
        <p className="text-sm font-medium text-muted-foreground">Or try an example</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {SAMPLES.map((s) => (
            <button
              key={s.label}
              disabled={loading}
              onClick={() => loadSource(s.src)}
              className="glass group overflow-hidden rounded-2xl text-left transition-all hover:-translate-y-1 hover:border-primary/50 disabled:opacity-50"
            >
              <img src={s.src} alt={s.label} loading="lazy" width={816} height={816} className="aspect-square w-full object-cover transition-transform group-hover:scale-105" />
              <span className="block px-3 py-2 text-xs font-medium sm:text-sm">{s.label}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Examples are analyzed live by the same AI — no pre-made answers.</p>
      </div>

      <RecentScans />
    </div>
  );
}

function RecentScans() {
  const [items, setItems] = useState<ScanRecord[]>([]);
  useEffect(() => setItems(loadHistory().slice(0, 6)), []);
  if (!items.length) return null;
  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold">Recently scanned</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((s) => (
          <li key={s.id}>
            <Link to="/result/$id" params={{ id: s.id }} className="glass flex items-center gap-3 rounded-2xl p-3 transition-colors hover:border-primary/50">
              <img src={s.image} alt={s.analysis.objectName} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0">
                <p className="truncate font-semibold">{s.analysis.objectName}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  {s.analysis.binColor && <span aria-hidden className="h-4 w-4 shrink-0 rounded border border-border" style={{ backgroundColor: BIN_SWATCH[s.analysis.binColor] }} />}
                  <span className="truncate">{s.analysis.binName ?? "Check local bin"}</span>
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

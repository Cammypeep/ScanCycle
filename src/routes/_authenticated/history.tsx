import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2, ScanLine, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearHistory, loadHistory, removeScan } from "@/lib/history";
import { MATERIAL_LABEL, RECYCLABILITY_LABEL, type ScanRecord } from "@/lib/scan-types";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Scan History — ScrapSense" },
      { name: "description", content: "Your recent ScrapSense material scans, saved on this device." },
      { property: "og:title", content: "Scan History — ScrapSense" },
      { property: "og:description", content: "Review and reopen your recent recycling scans." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [items, setItems] = useState<ScanRecord[] | null>(null);
  useEffect(() => setItems(loadHistory()), []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Saved on this device</p>
          <h1 className="text-3xl font-bold">Scan history</h1>
        </div>
        {items && items.length > 0 && (
          <Button
            variant="outline"
            onClick={() => {
              if (confirm("Clear all scan history?")) {
                clearHistory();
                setItems([]);
              }
            }}
          >
            <Trash2 className="h-4 w-4" /> Clear history
          </Button>
        )}
      </div>

      {items && items.length === 0 && (
        <div className="glass mt-10 rounded-3xl p-12 text-center">
          <Clock className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-semibold">No scans yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Your analyzed objects will appear here.</p>
          <Button asChild variant="hero" size="lg" className="mt-6">
            <Link to="/scan"><ScanLine className="h-4 w-4" /> Scan an Object</Link>
          </Button>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items?.map((s) => (
          <div key={s.id} className="glass group relative overflow-hidden rounded-2xl transition-all hover:-translate-y-1 hover:border-primary/40">
            <Link to="/result/$id" params={{ id: s.id }} className="block">
              <img src={s.image} alt={s.analysis.objectName} className="aspect-video w-full object-cover" />
              <div className="p-4">
                <p className="font-semibold">{s.analysis.objectName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {MATERIAL_LABEL[s.analysis.primaryMaterial]} · {RECYCLABILITY_LABEL[s.analysis.recyclability]}
                </p>
                <p className="mt-2 font-mono text-[11px] text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</p>
              </div>
            </Link>
            <button
              aria-label="Remove scan"
              onClick={() => {
                removeScan(s.id);
                setItems(loadHistory());
              }}
              className="glass absolute right-3 top-3 rounded-full p-2 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

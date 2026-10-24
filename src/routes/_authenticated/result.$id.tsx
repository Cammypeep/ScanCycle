import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultView } from "@/components/ResultView";
import { getScan } from "@/lib/history";
import type { ScanRecord } from "@/lib/scan-types";

export const Route = createFileRoute("/_authenticated/result/$id")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Saved Scan — ScrapSense" },
      { name: "description", content: "A saved ScrapSense material analysis." },
      { property: "og:title", content: "Saved Scan — ScrapSense" },
      { property: "og:description", content: "Review a saved recycling analysis." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResultPage,
});

function ResultPage() {
  const { id } = Route.useParams();
  const [rec, setRec] = useState<ScanRecord | null | undefined>(undefined);
  useEffect(() => setRec(getScan(id) ?? null), [id]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost"><Link to="/history"><ArrowLeft className="h-4 w-4" /> Back to history</Link></Button>
        <Button asChild variant="hero" size="lg"><Link to="/scan"><ScanLine className="h-4 w-4" /> Scan Another Object</Link></Button>
      </div>
      {rec === null && <p className="text-muted-foreground">This scan was not found on this device.</p>}
      {rec && <ResultView image={rec.image} analysis={rec.analysis} />}
    </div>
  );
}

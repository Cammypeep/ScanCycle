import { useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, Leaf, ShieldAlert, Info, ChevronDown, Layers, Recycle } from "lucide-react";
import { cn } from "@/lib/utils";
import { MATERIAL_LABEL, RECYCLABILITY_LABEL, type Analysis, type Recyclability } from "@/lib/scan-types";

const statusStyle: Record<Recyclability, { cls: string; Icon: typeof CheckCircle2 }> = {
  recyclable: { cls: "bg-primary/15 text-primary border-primary/30", Icon: CheckCircle2 },
  conditional: { cls: "bg-warning/15 text-warning border-warning/30", Icon: AlertTriangle },
  special_handling: { cls: "bg-info/15 text-info border-info/30", Icon: ShieldAlert },
  not_recyclable: { cls: "bg-destructive/15 text-destructive border-destructive/30", Icon: XCircle },
  uncertain: { cls: "bg-muted text-muted-foreground border-border", Icon: HelpCircle },
};

export function ResultView({ image, analysis: a }: { image: string; analysis: Analysis }) {
  const [open, setOpen] = useState(true);
  const [done, setDone] = useState<Record<number, boolean>>({});
  const st = statusStyle[a.recyclability] ?? statusStyle.uncertain;

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <div className="glass animate-rise overflow-hidden rounded-2xl">
          <img src={image} alt={a.objectName} className="aspect-square w-full object-cover" />
        </div>
        {a.safetyWarnings.length > 0 && (
          <div className="animate-rise rounded-2xl border border-destructive/30 bg-destructive/10 p-5">
            <div className="flex items-center gap-2 font-semibold text-destructive">
              <ShieldAlert className="h-5 w-5" /> Safety warnings
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {a.safetyWarnings.map((w, i) => (
                <li key={i} className="flex gap-2"><span className="text-destructive">•</span>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-4 lg:col-span-3">
        <div className="glass animate-rise rounded-2xl p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Identified object</p>
          <h2 className="mt-1 text-3xl font-bold">{a.objectName}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald px-3 py-1 text-sm font-semibold text-primary-foreground">
              <Layers className="h-3.5 w-3.5" /> {MATERIAL_LABEL[a.primaryMaterial] ?? a.primaryMaterial}
            </span>
            {a.secondaryMaterials.map((m) => (
              <span key={m} className="rounded-full border border-border bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                + {MATERIAL_LABEL[m] ?? m}
              </span>
            ))}
          </div>
          <div className={cn("mt-5 flex items-center gap-2 rounded-xl border px-4 py-3 font-medium", st.cls)}>
            <st.Icon className="h-5 w-5" /> {RECYCLABILITY_LABEL[a.recyclability] ?? a.recyclability}
          </div>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{a.identificationExplanation}</p>
          {(a.needsVerification || a.uncertaintyNotes) && (
            <div className="mt-4 flex gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm">
              <HelpCircle className="h-5 w-5 shrink-0 text-warning" />
              <div>
                {a.needsVerification && <p className="font-medium text-warning">Additional verification needed</p>}
                {a.uncertaintyNotes && <p className="mt-1 text-foreground/80">{a.uncertaintyNotes}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="glass animate-rise rounded-2xl">
          <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between p-6 text-left">
            <span className="flex items-center gap-2 text-lg font-semibold">
              <Recycle className="h-5 w-5 text-primary" /> Recycling prep checklist
            </span>
            <ChevronDown className={cn("h-5 w-5 transition-transform", open && "rotate-180")} />
          </button>
          {open && (
            <ul className="space-y-2 px-6 pb-6">
              {a.preparationSteps.map((s, i) => (
                <li key={i}>
                  <button
                    onClick={() => setDone({ ...done, [i]: !done[i] })}
                    className="flex w-full items-start gap-3 rounded-xl border border-border bg-secondary/50 p-3 text-left text-sm transition-colors hover:border-primary/40"
                  >
                    <CheckCircle2 className={cn("mt-0.5 h-4 w-4 shrink-0", done[i] ? "text-primary" : "text-muted-foreground/40")} />
                    <span className={cn(done[i] && "text-muted-foreground line-through")}>{s}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="animate-rise rounded-2xl border border-primary/25 bg-accent/40 p-6">
          <div className="flex items-center gap-2 font-semibold text-accent-foreground">
            <Leaf className="h-5 w-5" /> Environmental insight
          </div>
          <p className="mt-2 text-sm leading-relaxed">{a.environmentalInfo}</p>
        </div>

        <p className="flex gap-2 px-1 text-xs text-muted-foreground">
          <Info className="h-4 w-4 shrink-0" />
          Visual scans can't determine exact composition or guarantee recyclability. Local recycling policies vary — confirm accepted materials with your local recycling provider.
        </p>
      </div>
    </div>
  );
}

import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, ShieldAlert, Trash2, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { BIN_SWATCH, RECYCLABILITY_LABEL, type Analysis, type Recyclability } from "@/lib/scan-types";

const statusStyle: Record<Recyclability, { cls: string; Icon: typeof CheckCircle2 }> = {
  recyclable: { cls: "bg-primary/15 text-primary border-primary/30", Icon: CheckCircle2 },
  conditional: { cls: "bg-warning/15 text-warning border-warning/30", Icon: AlertTriangle },
  special_handling: { cls: "bg-info/15 text-info border-info/30", Icon: ShieldAlert },
  not_recyclable: { cls: "bg-destructive/15 text-destructive border-destructive/30", Icon: XCircle },
  uncertain: { cls: "bg-muted text-muted-foreground border-border", Icon: HelpCircle },
};

export function ResultView({ image, analysis: a }: { image: string; analysis: Analysis }) {
  const st = statusStyle[a.recyclability] ?? statusStyle.uncertain;
  const steps = [...a.safetyWarnings, ...a.preparationSteps];

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="glass animate-rise overflow-hidden rounded-2xl lg:col-span-2">
        <img src={image} alt={a.objectName} className="aspect-square w-full object-cover" />
      </div>

      <div className="space-y-4 lg:col-span-3">
        <div className="glass animate-rise rounded-2xl p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">1 · What it is</p>
          <h2 className="mt-1 text-3xl font-bold">{a.objectName}</h2>
          <div className={cn("mt-4 flex items-center gap-2 rounded-xl border px-4 py-3 font-medium", st.cls)}>
            <st.Icon className="h-5 w-5" /> {RECYCLABILITY_LABEL[a.recyclability] ?? a.recyclability}
          </div>
        </div>

        {a.binName && (
          <div className="glass animate-rise rounded-2xl p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">2 · Which bin</p>
            <div className="mt-3 flex items-center gap-3">
              <span
                className="grid h-12 w-12 place-items-center rounded-xl border border-border"
                style={{ backgroundColor: a.binColor ? BIN_SWATCH[a.binColor] : undefined }}
              >
                <Trash2 className="h-6 w-6 text-primary-foreground" />
              </span>
              <span className="text-xl font-semibold">{a.binName}</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Bin colors vary by city — check your local rules.</p>
          </div>
        )}

        <div className="glass animate-rise rounded-2xl p-6">
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <ListChecks className="h-4 w-4" /> 3 · Before you recycle
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

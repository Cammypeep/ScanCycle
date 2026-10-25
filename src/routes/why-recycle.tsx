import { createFileRoute, Link } from "@tanstack/react-router";
import { Zap, Factory, Infinity as InfinityIcon, Trees, Droplets, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/why-recycle")({
  head: () => ({
    meta: [
      { title: "Why Recycling Is Important — ScanCycle" },
      { name: "description", content: "How recycling saves energy, resources and landfill space." },
      { property: "og:title", content: "Why Recycling Is Important — ScanCycle" },
      { property: "og:description", content: "How recycling saves energy, resources and landfill space." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WhyRecycle,
});

const facts = [
  { icon: Zap, stat: "~95%", label: "less energy to make aluminum from recycled cans than from raw ore" },
  { icon: Factory, stat: "#1", label: "steel is the most recycled material on the planet by weight" },
  { icon: InfinityIcon, stat: "∞", label: "metals and glass can be recycled again and again without losing quality" },
  { icon: Trees, stat: "Less", label: "raw material mining and logging when we reuse what we already have" },
  { icon: Droplets, stat: "Cleaner", label: "air and water — fewer items end up in landfills or the ocean" },
  { icon: Users, stat: "Jobs", label: "recycling and remanufacturing support local industries" },
];

function WhyRecycle() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-primary">Why recycling is important</p>
      <h1 className="mt-2 max-w-3xl text-4xl font-bold sm:text-5xl">
        Every item you recycle becomes <span className="text-emerald">a resource</span>, not trash.
      </h1>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {facts.map((f) => (
          <div key={f.label} className="glass rounded-2xl p-6">
            <f.icon className="h-5 w-5 text-primary" />
            <div className="mt-3 font-display text-3xl font-bold text-emerald">{f.stat}</div>
            <p className="mt-1 text-sm text-muted-foreground">{f.label}</p>
          </div>
        ))}
      </div>
      <Button asChild variant="hero" size="lg" className="mt-12">
        <Link to="/scan">Start scanning</Link>
      </Button>
    </section>
  );
}

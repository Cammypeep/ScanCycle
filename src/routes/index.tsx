import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Cpu, ClipboardCheck, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScrapSense — Turn Waste Into Resources" },
      { name: "description", content: "Snap a photo, let AI identify the material, and get clear recycling instructions." },
      { property: "og:title", content: "ScrapSense — Turn Waste Into Resources" },
      { property: "og:description", content: "AI-powered material identification and recycling guidance. Snap it. Identify it. Recycle it." },
    ],
  }),
  component: Index,
});

const steps = [
  { icon: Camera, title: "Snap it", text: "Upload or take a photo of any object you want to throw away." },
  { icon: Cpu, title: "Identify it", text: "Our vision AI estimates the object and its likely materials." },
  { icon: ClipboardCheck, title: "Recycle it", text: "Get a prep checklist, safety notes, and where it should go." },
];


function Index() {
  return (
    <>
      <section className="relative overflow-hidden">
        <img src={hero} alt="" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="absolute inset-0 grid-lines opacity-60" />
        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 sm:pt-32">
          <div className="animate-rise inline-flex items-center gap-2 rounded-full glass px-3 py-1 font-mono text-xs text-accent-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Snap it. Identify it. Recycle it.
          </div>
          <h1 className="animate-rise mt-6 max-w-3xl text-5xl font-bold leading-[1.02] sm:text-7xl" style={{ animationDelay: "80ms" }}>
            <span className="text-steel">Turn Waste</span>
            <br />
            <span className="text-emerald">Into Resources.</span>
          </h1>
          <p className="animate-rise mt-6 max-w-xl text-lg text-muted-foreground" style={{ animationDelay: "160ms" }}>
            Point your camera at a can, bottle or scrap part. ScrapSense uses AI vision to estimate what it's made of and tells you how to recycle it properly.
          </p>
          <div className="animate-rise mt-10 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            <Button asChild variant="hero" size="xl">
              <Link to="/scan"><ScanLine className="h-5 w-5" /> Scan an Object</Link>
            </Button>
            <Button asChild variant="glass" size="xl">
              <Link to="/history">View history</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">How it works</p>
        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Three steps. Ten seconds.</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="glass group rounded-2xl p-6 transition-all hover:-translate-y-1 hover:border-primary/40">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <s.icon className="h-6 w-6" />
                </span>
                <span className="font-mono text-sm text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="mt-6 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="glass relative overflow-hidden rounded-3xl p-8 sm:p-12">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Why recycling is important</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-bold sm:text-4xl">
            Small actions save energy, resources and landfill space.
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg">
              <Link to="/why-recycle">Learn why it matters</Link>
            </Button>
            <Button asChild variant="glass" size="lg">
              <Link to="/scan">Start scanning</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

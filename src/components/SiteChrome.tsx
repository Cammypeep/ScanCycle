import { Link } from "@tanstack/react-router";
import { Recycle, ScanLine, History } from "lucide-react";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald shadow-glow">
        <Recycle className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        Scrap<span className="text-emerald">Sense</span>
      </span>
    </Link>
  );
}

const linkCls =
  "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="flex items-center gap-1">
          <Link to="/scan" className={linkCls} activeProps={{ className: "text-foreground bg-secondary" }}>
            <ScanLine className="h-4 w-4" /> <span className="hidden sm:inline">Scanner</span>
          </Link>
          <Link to="/history" className={linkCls} activeProps={{ className: "text-foreground bg-secondary" }}>
            <History className="h-4 w-4" /> <span className="hidden sm:inline">History</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <span>ScrapSense · Steel &amp; Steam Hackathon</span>
        <span>AI results are guidance only. Always check your local recycling rules.</span>
      </div>
    </footer>
  );
}

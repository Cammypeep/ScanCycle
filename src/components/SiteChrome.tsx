import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { profileQuery } from "@/lib/account";
import { supabase } from "@/integrations/supabase/client";
import { setHistoryOwner } from "@/lib/history";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Recycle, ScanLine, Users, Settings, LogOut, Medal, BarChart3, Menu } from "lucide-react";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald shadow-glow">
        <Recycle className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        Scan<span className="text-emerald">Cycle</span>
      </span>
    </Link>
  );
}

const linkCls =
  "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground";

export function SiteHeader() {
  const { data: profile } = useQuery(profileQuery);
  const qc = useQueryClient();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="flex items-center gap-1">
          {profile ? <>
          <Link to="/scan" className={linkCls} activeProps={{ className: "!text-foreground bg-primary/25 font-medium" }}>
            <ScanLine className="h-4 w-4" /> <span className="hidden sm:inline">Scanner</span>
          </Link>
          <Link to="/rewards" className={linkCls} activeProps={{ className: "!text-foreground bg-primary/25 font-medium" }} aria-label="Recycle"><Recycle className="h-4 w-4"/><span className="hidden sm:inline">Recycle</span></Link>
          <Link to="/leaderboard" className={linkCls} activeProps={{ className: "!text-foreground bg-sun/25 font-medium" }} aria-label="Leaderboard"><Medal className="h-4 w-4"/><span className="hidden sm:inline">Leaderboard</span></Link>
          <Link to="/stats" className={linkCls} activeProps={{ className: "!text-foreground bg-sky/25 font-medium" }} aria-label="Graph"><BarChart3 className="h-4 w-4"/><span className="hidden sm:inline">Graph</span></Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Menu"><Menu className="h-5 w-5"/></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild><Link to="/friends"><Users className="h-4 w-4"/>Friends</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/settings"><Settings className="h-4 w-4"/>Settings</Link></DropdownMenuItem>
              <DropdownMenuSeparator/>
              <DropdownMenuItem onSelect={async()=>{await qc.cancelQueries();qc.clear();setHistoryOwner(null);await supabase.auth.signOut();navigate({to:"/auth",replace:true});}}><LogOut className="h-4 w-4"/>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </> : <Link to="/auth" className={linkCls}>Sign in</Link>}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <span className="flex flex-wrap gap-x-3"><Link to="/why-recycle" className="hover:text-foreground">Why recycling is important</Link><a href="https://www.epa.gov/recycle/recycling-basics-and-benefits" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">EPA: Recycling benefits ↗</a></span>
        <span>AI results are guidance only. Always check your local recycling rules.</span>
      </div>
    </footer>
  );
}

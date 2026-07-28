import { createFileRoute, Link, Outlet, useRouter, useRouterState } from "@tanstack/react-router";
import { Bell, Search, LogOut, ShieldAlert } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Toaster, toast } from "sonner";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchMarketTrends, MarketTrendsResponse } from "../lib/api";
import { useAuth } from "@/hooks/auth/useAuth";

export interface MarketDataContextType {
  query: string;
  results: MarketTrendsResponse | null;
  loading: boolean;
  error: string | null;
  triggerSearch: (q: string) => Promise<void>;
}

export const MarketDataContext = createContext<MarketDataContextType | null>(null);

export const useMarketData = () => {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error("useMarketData must be used within a MarketDataProvider");
  }
  return context;
};

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Dashboard — Compete IQ" },
      { name: "description", content: "Your verified competitor intelligence workspace." },
    ],
  }),
  component: AppLayout,
});

function AppLayout() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const router = useRouter();
  
  const { user, isAuthenticated, isEmailVerified, isLoading: authLoading, logout } = useAuth();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MarketTrendsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInputValue, setSearchInputValue] = useState("");

  const userInitials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "IQ";

  const triggerSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setQuery(q);
    setSearchInputValue(q);
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMarketTrends(q);
      setResults(res);
    } catch (err: any) {
      setError(err.message || "Failed to fetch market trends");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.navigate({ to: "/login" });
        return;
      }
      if (!isEmailVerified) {
        router.navigate({ to: "/verify-email" });
        return;
      }
      triggerSearch("immune support");
    }
  }, [authLoading, isAuthenticated, isEmailVerified, router, triggerSearch]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Verifying Session Security...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isEmailVerified) {
    return null; // Redirect handled by useEffect
  }

  return (
    <MarketDataContext.Provider value={{ query, results, loading, error, triggerSearch }}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border glass px-3 sm:px-4">
              <SidebarTrigger />
              <div className="relative ml-2 hidden max-w-md flex-1 sm:block">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search competitors, products, ingredients, claims…"
                  className="h-9 pl-8"
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      triggerSearch(searchInputValue);
                    }
                  }}
                />
              </div>
              <div className="ml-auto flex items-center gap-2">
                <ThemeToggle />
                <Button variant="ghost" size="icon" asChild aria-label="Alerts" title="Alerts">
                  <Link to="/app/alerts">
                    <Bell className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  title="Sign Out"
                  aria-label="Sign Out of workspace"
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
                <Avatar className="h-8 w-8 ring-2 ring-primary/20" title={user?.fullName || "User Profile"}>
                  <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary font-mono">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </div>
            </header>
            
            <main key={pathname} className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
              {loading && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs font-semibold text-muted-foreground shadow-sm">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>Querying intelligence agents for "{query}"...</span>
                </div>
              )}
              {error ? (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center text-destructive">
                  <h3 className="font-semibold">Search Error</h3>
                  <p className="mt-1 text-sm">{error}</p>
                  <Button variant="outline" size="sm" onClick={() => triggerSearch(query)} className="mt-4">
                    Retry Search
                  </Button>
                </div>
              ) : (
                <Outlet />
              )}
            </main>
          </div>
          <Toaster />
        </div>
      </SidebarProvider>
    </MarketDataContext.Provider>
  );
}

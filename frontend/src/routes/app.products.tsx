import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { products } from "@/lib/mock-data";

import { useMarketData } from "./app";

export const Route = createFileRoute("/app/products")({
  component: ProductsPage,
});

const gradients: Record<string, string> = {
  sleep: "from-indigo-500/40 to-blue-500/20",
  immunity: "from-emerald-500/40 to-teal-500/20",
  collagen: "from-pink-500/40 to-rose-500/20",
  focus: "from-violet-500/40 to-fuchsia-500/20",
  greens: "from-lime-500/40 to-emerald-500/20",
  magnesium: "from-sky-500/40 to-cyan-500/20",
};

function ProductsPage() {
  const { results } = useMarketData();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

  const displayedProducts = useMemo(() => {
    if (!results || !results.products.length) {
      return products;
    }
    return results.products.map((p, idx) => {
      const productRev = results.revenue?.find(r => r.product_source_id === p.source_id);
      const estimatedPrice = productRev ? (productRev.estimated_revenue_usd / 1000) : 19.99;
      return {
        id: p.source_id || String(idx),
        name: p.name,
        brand: p.brand || "Unknown Brand",
        category: p.category || "General",
        heroIngredient: p.ingredients_text ? p.ingredients_text.split(",")[0] : "N/A",
        claims: results.claims?.filter(c => c.product_source_id === p.source_id).map(c => c.claim_text) || [],
        price: estimatedPrice > 0 ? estimatedPrice : 19.99,
        currency: "USD",
        launchDate: "Recent",
        retailer: p.source === "openfoodfacts" ? "Open Food Facts" : "USDA FDC",
        positioning: p.category || "Immune Support",
        opportunityScore: Math.round(p.match_score * 100) || 85,
        image: "immunity"
      };
    });
  }, [results]);

  const categories = useMemo(
    () => Array.from(new Set(displayedProducts.map((p) => p.category))),
    [displayedProducts],
  );

  const filtered = displayedProducts.filter(
    (p) =>
      (cat === "all" || p.category === cat) &&
      (p.name + p.brand + p.heroIngredient + p.claims.join(" "))
        .toLowerCase()
        .includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            AI-extracted SKUs across every monitored brand.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-9 pl-8"
              placeholder="Search products…"
            />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <Card key={p.id} className="overflow-hidden shadow-soft transition hover:shadow-elegant">
            <div className={`h-32 bg-gradient-to-br ${gradients[p.image] ?? "from-primary/40 to-accent/20"}`}>
              <div className="flex h-full items-end justify-between p-4">
                <Badge className="bg-background/80 text-foreground backdrop-blur">
                  {p.category}
                </Badge>
                <Badge variant="secondary" className="gap-1 bg-background/80 backdrop-blur">
                  <Sparkles className="h-3 w-3 text-primary" /> {p.opportunityScore}
                </Badge>
              </div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{p.name}</CardTitle>
              <CardDescription>
                {p.brand} · {p.positioning}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Hero ingredient</div>
                <div className="font-medium">{p.heroIngredient}</div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.claims.map((c) => (
                  <Badge key={c} variant="outline" className="text-xs">
                    {c}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <div>
                  <div className="text-xs text-muted-foreground">Price</div>
                  <div className="font-semibold">${p.price.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Retailer</div>
                  <div className="text-sm">{p.retailer}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-16 text-center text-sm text-muted-foreground">
          No products match your filters.
        </div>
      )}
    </div>
  );
}

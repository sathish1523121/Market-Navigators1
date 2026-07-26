import { createFileRoute } from "@tanstack/react-router";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ingredientTrend } from "@/lib/mock-data";

import { useMarketData } from "./app";
import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/ingredients")({
  component: IngredientsPage,
});

const topMock = [
  { name: "Ashwagandha KSM-66", score: 92 },
  { name: "Marine Collagen", score: 84 },
  { name: "Lion's Mane", score: 71 },
  { name: "Black Elderberry", score: 63 },
  { name: "Magnesium Glycinate", score: 58 },
  { name: "Spirulina", score: 42 },
];

function IngredientsPage() {
  const { results } = useMarketData();

  const displayedTop = useMemo(() => {
    if (!results || !results.ingredients.length) {
      return topMock;
    }
    const counts: Record<string, number> = {};
    results.ingredients.forEach(i => {
      counts[i.ingredient_name] = (counts[i.ingredient_name] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const maxFreq = sorted[0]?.[1] || 1;
    return sorted.slice(0, 8).map(([name, freq]) => ({
      name,
      score: Math.round((freq / maxFreq) * 100)
    }));
  }, [results]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ingredients</h1>
        <p className="text-sm text-muted-foreground">
          Hero ingredient adoption across the tracked catalog.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-soft lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Adoption over time</CardTitle>
            <CardDescription>Weekly mentions in new launches</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ingredientTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Ashwagandha" stroke="var(--chart-1)" strokeWidth={2} />
                <Line type="monotone" dataKey="Collagen" stroke="var(--chart-2)" strokeWidth={2} />
                <Line type="monotone" dataKey="Lion's Mane" stroke="var(--chart-3)" strokeWidth={2} />
                <Line type="monotone" dataKey="Elderberry" stroke="var(--chart-4)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Trending ingredients</CardTitle>
            <CardDescription>{results ? "Frequencies in query results" : "Growth score, last 30 days"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {displayedTop.map((t) => (
              <div key={t.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-muted-foreground">{t.score}</span>
                </div>
                <Progress value={t.score} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {results && results.ingredients.length > 0 && (
        <Card className="shadow-soft animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">Active Ingredients & Formulations</CardTitle>
            <CardDescription>Flagged ingredients extracted from matched SKUs</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient Name</TableHead>
                    <TableHead>Active Component?</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount per Serving</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.ingredients.map((ing, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium capitalize">{ing.ingredient_name}</TableCell>
                      <TableCell>
                        <Badge variant={ing.is_active_ingredient ? "default" : "secondary"}>
                          {ing.is_active_ingredient ? "Active" : "Standard"}
                        </Badge>
                      </TableCell>
                      <TableCell>{ing.category || "General formulation"}</TableCell>
                      <TableCell>{ing.amount_per_serving || "Not specified"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

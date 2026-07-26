import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { claimsDistribution, products } from "@/lib/mock-data";

import { useMarketData } from "./app";
import { useMemo } from "react";

export const Route = createFileRoute("/app/claims")({
  component: ClaimsPage,
});

function ClaimsPage() {
  const { results } = useMarketData();

  const displayedClaimsDistribution = useMemo(() => {
    if (!results || !results.claims.length) {
      return claimsDistribution;
    }
    const counts: Record<string, number> = {};
    results.claims.forEach(c => {
      const typeLabel = c.claim_type.toUpperCase();
      counts[typeLabel] = (counts[typeLabel] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [results]);

  const allClaims = useMemo(() => {
    if (!results || !results.claims.length) {
      return products.flatMap((p) => p.claims);
    }
    return results.claims.map(c => c.claim_text);
  }, [results]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Claims</h1>
        <p className="text-sm text-muted-foreground">
          What competitors are saying, structured and searchable.
        </p>
      </div>
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Top claims</CardTitle>
          <CardDescription>Frequency across tracked SKUs</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayedClaimsDistribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={12} width={100} />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {results && results.claims.length > 0 && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-base">Live Claims Details</CardTitle>
            <CardDescription>Extracted claims with confidence scores and evidence</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim Text</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Evidence Snippet</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.claims.map((c, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{c.claim_text}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{c.claim_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.confidence >= 0.8 ? "default" : "secondary"}>
                          {Math.round(c.confidence * 100)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs italic max-w-xs truncate">
                        {c.evidence_snippet || "No snippet extracted"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Claim library</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {allClaims.map((c, i) => (
            <Badge key={i} variant="secondary" className="px-3 py-1.5 text-sm">
              {c}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

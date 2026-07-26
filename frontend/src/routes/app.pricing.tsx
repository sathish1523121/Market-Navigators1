import { createFileRoute } from "@tanstack/react-router";
import {
  CartesianGrid,
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { products } from "@/lib/mock-data";

export const Route = createFileRoute("/app/pricing")({
  component: PricingPage,
});

const history = [
  { d: "W1", NutraPeak: 26.5, PureBloom: 45, VitalCore: 42 },
  { d: "W2", NutraPeak: 26.5, PureBloom: 44, VitalCore: 41 },
  { d: "W3", NutraPeak: 24.9, PureBloom: 44, VitalCore: 40 },
  { d: "W4", NutraPeak: 22.9, PureBloom: 43, VitalCore: 39 },
  { d: "W5", NutraPeak: 21.5, PureBloom: 44, VitalCore: 39 },
];

function PricingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pricing insights</h1>
        <p className="text-sm text-muted-foreground">
          Price movements across the tracked catalog.
        </p>
      </div>
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Price history — hero SKUs</CardTitle>
          <CardDescription>Last 5 weeks, USD</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="NutraPeak" stroke="var(--chart-1)" strokeWidth={2} />
              <Line type="monotone" dataKey="PureBloom" stroke="var(--chart-2)" strokeWidth={2} />
              <Line type="monotone" dataKey="VitalCore" stroke="var(--chart-3)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Recent pricing changes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Old</TableHead>
                <TableHead>New</TableHead>
                <TableHead className="text-right">Δ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p, i) => {
                const oldP = p.price * (i % 2 === 0 ? 1.12 : 0.94);
                const delta = ((p.price - oldP) / oldP) * 100;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.brand}</TableCell>
                    <TableCell>${oldP.toFixed(2)}</TableCell>
                    <TableCell>${p.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={delta < 0 ? "default" : "outline"}
                        className={delta < 0 ? "bg-accent text-accent-foreground" : ""}
                      >
                        {delta > 0 ? "+" : ""}
                        {delta.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

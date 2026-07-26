import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/reports")({
  component: ReportsPage,
});

const reports = [
  { title: "Weekly Competitor Digest", desc: "All launches, price moves, and claims for the week." },
  { title: "Category Deep-Dive: Sleep", desc: "Positioning, pricing, and ingredient adoption." },
  { title: "Ingredient Radar — Q4", desc: "Rising hero ingredients across tracked brands." },
  { title: "Pricing Movement Report", desc: "Discount & MSRP changes by retailer." },
];

function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Ready-to-share intelligence briefings.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((r) => (
          <Card key={r.title} className="shadow-soft">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{r.title}</CardTitle>
                  <CardDescription>{r.desc}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

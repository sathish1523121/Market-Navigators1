import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Bell, Megaphone, Package, Radio, TrendingDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { alerts } from "@/lib/mock-data";

export const Route = createFileRoute("/app/alerts")({
  component: AlertsPage,
});

const iconMap = {
  new_product: Package,
  price_drop: TrendingDown,
  website_update: Radio,
  social: Megaphone,
  ad_campaign: Megaphone,
  packaging: AlertTriangle,
} as const;

function AlertsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
          <p className="text-sm text-muted-foreground">
            {alerts.length} recent signals from your monitored competitors.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <Bell className="h-3 w-3 text-primary" /> Real-time
        </Badge>
      </div>
      <div className="grid gap-3">
        {alerts.map((a) => {
          const Icon = iconMap[a.type];
          return (
            <Card key={a.id} className="shadow-soft transition hover:shadow-elegant">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                      a.severity === "high"
                        ? "bg-destructive/10 text-destructive"
                        : a.severity === "medium"
                          ? "bg-warning/10 text-warning"
                          : "bg-accent/10 text-accent"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-sm">{a.title}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {a.competitor}
                      </Badge>
                      <Badge
                        variant={a.severity === "high" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {a.severity}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">{a.description}</CardDescription>
                  </div>
                  <div className="shrink-0 text-xs text-muted-foreground">
                    {a.time}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-muted-foreground">
                Type: {a.type.replace("_", " ")}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

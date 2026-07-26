import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { competitors as initial, type Competitor } from "@/lib/mock-data";

export const Route = createFileRoute("/app/competitors")({
  component: CompetitorsPage,
});

function CompetitorsPage() {
  const [list, setList] = useState<Competitor[]>(initial);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = list.filter((c) =>
    (c.name + c.industry + c.country).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Competitors</h1>
          <p className="text-sm text-muted-foreground">
            {list.length} monitored brands across your workspace.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> Add competitor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add competitor</DialogTitle>
              <DialogDescription>
                Give us a URL — we'll discover products, pricing, and claims.
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                const name = String(f.get("name") ?? "").trim();
                const website = String(f.get("website") ?? "").trim();
                if (!name || !website) return;
                setList((l) => [
                  {
                    id: crypto.randomUUID(),
                    name,
                    website,
                    industry: String(f.get("industry") ?? "General"),
                    country: String(f.get("country") ?? "—"),
                    status: "scanning",
                    lastScan: "just now",
                    products: 0,
                  },
                  ...l,
                ]);
                setOpen(false);
                toast.success(`${name} added — scanning`);
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Company name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" name="website" required placeholder="brand.com" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" name="industry" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" name="country" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Input id="notes" name="notes" placeholder="Optional" />
              </div>
              <DialogFooter>
                <Button type="submit">Add & scan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-soft">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">All competitors</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-9 pl-8"
                placeholder="Search competitors…"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Last scan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                        {c.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.website}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{c.industry}</TableCell>
                  <TableCell className="text-sm">{c.country}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        c.status === "active"
                          ? "default"
                          : c.status === "scanning"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{c.products}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.lastScan}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    No competitors match "{q}".
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

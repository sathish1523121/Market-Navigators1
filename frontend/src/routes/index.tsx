import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  CheckCircle2,
  DollarSign,
  Eye,
  LineChart,
  Package,
  Radar,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Compete IQ — AI Competitor Marketing Intelligence" },
      {
        name: "description",
        content:
          "Monitor competitors, analyze product trends, track pricing, and receive AI-powered market intelligence from one unified platform.",
      },
      {
        property: "og:title",
        content: "Compete IQ — AI Competitor Marketing Intelligence",
      },
      {
        property: "og:description",
        content:
          "Automate competitor research across websites, products, pricing, ads, and social with a modern AI intelligence dashboard.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Users, title: "Competitor Monitoring", desc: "Track every competitor's website, launches, and moves in real time." },
  { icon: Package, title: "Product Intelligence", desc: "Auto-extract ingredients, claims, packaging, and positioning." },
  { icon: TrendingUp, title: "AI Trend Analysis", desc: "Spot rising categories and ingredients before your competitors do." },
  { icon: DollarSign, title: "Pricing Insights", desc: "Historical pricing, drops, bundles, and MSRP shifts by retailer." },
  { icon: Sparkles, title: "Claims Extraction", desc: "Structured claims across every SKU — sortable, comparable, actionable." },
  { icon: Bot, title: "AI Search Assistant", desc: "Ask questions in plain English and get charts, tables, and summaries." },
  { icon: Bell, title: "Real-time Alerts", desc: "Get notified the moment competitors ship, discount, or refresh." },
  { icon: BarChart3, title: "Interactive Dashboard", desc: "A single command center for your brand, product, and BI teams." },
];

const steps = [
  { n: "01", title: "Connect Competitors", desc: "Add any brand by URL — we handle discovery." },
  { n: "02", title: "AI Collects Data", desc: "Websites, products, ads, social, retail — continuously." },
  { n: "03", title: "AI Extracts Insights", desc: "Ingredients, claims, pricing, positioning, category signals." },
  { n: "04", title: "Visual Dashboard", desc: "Interactive charts, tables, and trend cards." },
  { n: "05", title: "Business Decisions", desc: "Ship the right product, at the right price, at the right time." },
];

const plans = [
  {
    name: "Starter",
    price: "$149",
    tag: "For small brand teams",
    features: ["Up to 5 competitors", "500 tracked products", "Weekly scans", "Email alerts"],
  },
  {
    name: "Professional",
    price: "$449",
    tag: "Most popular",
    highlight: true,
    features: [
      "Up to 25 competitors",
      "10,000 tracked products",
      "Daily scans",
      "AI Search Assistant",
      "Slack + email alerts",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    tag: "For intelligence teams",
    features: [
      "Unlimited competitors",
      "Custom retailers & regions",
      "Hourly scans",
      "SSO / SAML",
      "Dedicated CSM",
    ],
  },
];

const faqs = [
  {
    q: "Which industries does Compete IQ support?",
    a: "We're purpose-built for health & wellness, supplements, beauty, FMCG, and consumer e-commerce, but the system generalizes to any brand-driven category.",
  },
  {
    q: "How often is data refreshed?",
    a: "Depending on your plan, competitor surfaces are re-scanned hourly, daily, or weekly. Alerts fire in real time whenever meaningful changes are detected.",
  },
  {
    q: "Can I export insights to my BI tools?",
    a: "Yes. Every table, chart, and report can be exported to CSV, and Enterprise plans include an API and webhook layer.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. Compete IQ is a hosted SaaS platform — sign in from any browser and start monitoring in minutes.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 glass">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-hero text-primary-foreground shadow-elegant">
              <Radar className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">Compete IQ</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Start free trial</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 gap-1.5">
              <Sparkles className="h-3 w-3 text-primary" />
              AI Market Intelligence for modern brands
            </Badge>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              AI-Powered Competitor{" "}
              <span className="bg-gradient-hero-text">
                Marketing Intelligence
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              Monitor competitors, analyze product trends, track pricing, discover
              market opportunities, and receive AI-powered insights from one
              unified platform.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link to="/signup">
                  Start Free Trial <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline">Book Demo</Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-accent" /> No credit card</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-accent" /> 14-day trial</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-accent" /> Set up in minutes</span>
            </div>
          </div>

          {/* Dashboard preview */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="absolute -inset-x-8 -top-6 bottom-0 -z-10 rounded-[2rem] bg-gradient-hero opacity-20 blur-3xl" />
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elegant">
              <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                <div className="ml-3 h-6 flex-1 rounded-md border border-border bg-background/60" />
              </div>
              <div className="grid grid-cols-12 gap-4 p-6">
                <div className="col-span-12 grid grid-cols-2 gap-3 md:col-span-4 md:grid-cols-1">
                  {[
                    { k: "Competitors", v: "24", i: Users },
                    { k: "Products tracked", v: "8,412", i: Package },
                    { k: "New launches (7d)", v: "17", i: Zap },
                    { k: "Active alerts", v: "6", i: Bell },
                  ].map((s) => (
                    <div key={s.k} className="rounded-xl border border-border bg-background/60 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{s.k}</span>
                        <s.i className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="mt-2 text-2xl font-semibold">{s.v}</div>
                    </div>
                  ))}
                </div>
                <div className="col-span-12 rounded-xl border border-border bg-background/60 p-4 md:col-span-8">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Competitor activity</div>
                      <div className="text-xs text-muted-foreground">Launches vs pricing changes</div>
                    </div>
                    <LineChart className="h-4 w-4 text-primary" />
                  </div>
                  <svg viewBox="0 0 400 140" className="h-40 w-full">
                    <defs>
                      <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,110 L40,90 L80,100 L120,70 L160,80 L200,55 L240,60 L280,40 L320,50 L360,25 L400,35 L400,140 L0,140 Z" fill="url(#g1)" />
                    <path d="M0,110 L40,90 L80,100 L120,70 L160,80 L200,55 L240,60 L280,40 L320,50 L360,25 L400,35" fill="none" stroke="var(--primary)" strokeWidth="2" />
                    <path d="M0,120 L40,115 L80,105 L120,110 L160,95 L200,100 L240,85 L280,90 L320,75 L360,80 L400,70" fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 3" />
                  </svg>
                </div>
                <div className="col-span-12 grid gap-3 md:grid-cols-3">
                  {["Sleep +32%", "Beauty +41%", "Cognitive +24%"].map((t) => (
                    <div key={t} className="rounded-xl border border-border bg-background/60 p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <TrendingUp className="h-3.5 w-3.5 text-accent" /> Trending category
                      </div>
                      <div className="mt-2 text-sm font-medium">{t}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary">Platform</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            One system for every competitive signal
          </h2>
          <p className="mt-3 text-muted-foreground">
            Websites, products, packaging, claims, ingredients, pricing, ads,
            social — collected, structured, and made searchable.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant"
            >
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary">How it works</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              From raw web signals to decisions in five steps
            </h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-5">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="text-xs font-medium text-primary">{s.n}</div>
                <div className="mt-2 text-sm font-semibold">{s.title}</div>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <Badge variant="secondary">Why teams switch</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Save weeks of manual research every quarter
            </h2>
            <p className="mt-3 text-muted-foreground">
              Replace scattered spreadsheets and screenshot dumps with a live
              intelligence system your brand, product, and BI teams can share.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Save research time across brand, product, and BI",
                "Track competitors automatically, 24/7",
                "Identify emerging trends before they scale",
                "Make sharper product and pricing decisions",
                "Reduce manual work for research analysts",
                "Improve marketing strategy with fresh evidence",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Search, k: "Faster research", v: "10×" },
              { icon: Eye, k: "Coverage", v: "24/7" },
              { icon: Zap, k: "Signals / day", v: "1.2k+" },
              { icon: TrendingUp, k: "Trends caught early", v: "+38%" },
            ].map((m) => (
              <div key={m.k} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <m.icon className="h-5 w-5 text-primary" />
                <div className="mt-4 text-3xl font-semibold">{m.v}</div>
                <div className="text-sm text-muted-foreground">{m.k}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary">Pricing</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Simple pricing that scales with your intelligence needs
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl border p-6 shadow-soft ${
                  p.highlight
                    ? "border-primary bg-card shadow-elegant"
                    : "border-border bg-card"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-6 rounded-full bg-gradient-hero px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                    Most popular
                  </div>
                )}
                <div className="text-sm font-medium">{p.name}</div>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <div className="text-4xl font-semibold tracking-tight">{p.price}</div>
                  {p.price !== "Custom" && (
                    <div className="text-sm text-muted-foreground">/month</div>
                  )}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{p.tag}</div>
                <Button
                  className="mt-6 w-full"
                  variant={p.highlight ? "default" : "outline"}
                  asChild
                >
                  <Link to="/signup">Get started</Link>
                </Button>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <div className="text-center">
          <Badge variant="secondary">FAQ</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>
        <Accordion type="single" collapsible className="mt-10">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`i-${i}`}>
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-hero p-10 text-primary-foreground shadow-elegant sm:p-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Ready to know what your competitors ship next?
            </h2>
            <p className="mt-3 text-primary-foreground/80">
              Set up your first 5 competitors in under 3 minutes.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/signup">Start Free Trial</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                Book Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <div className="grid h-6 w-6 place-items-center rounded-md bg-gradient-hero text-primary-foreground">
              <Radar className="h-3 w-3" />
            </div>
            <span>© {new Date().getFullYear()} Compete IQ</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a href="#" className="hover:text-foreground">About</a>
            <a href="#" className="hover:text-foreground">Contact</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

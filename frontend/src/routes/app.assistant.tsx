import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { categoryTrend } from "@/lib/mock-data";

export const Route = createFileRoute("/app/assistant")({
  component: AssistantPage,
});

import { useMarketData } from "./app";
import { fetchMarketTrends, sendAssistantChat } from "../lib/api";

type Msg = { role: "user" | "assistant"; content: string; chart?: boolean; chartData?: any[] };

const agentSteps = [
  { name: "Orchestrator", description: "Plans the query" },
  { name: "Claims", description: "Extracts claims" },
  { name: "Ingredients", description: "Finds key ingredients" },
  { name: "Revenue", description: "Attributes revenue" },
  { name: "Matching", description: "Maps to categories" },
];

const starters = [
  "vitamin c",
  "ashwagandha",
  "protein",
  "immune support",
];

function AssistantPage() {
  const { triggerSearch } = useMarketData();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi — I'm your market intelligence assistant powered by Gemini 2.5 Flash. Ask me about competitors, categories, ingredients, or claims.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const workflowPreview = useMemo(() => {
    if (loading) {
      return agentSteps.map((step, index) => ({
        ...step,
        active: index === 0 || index === 1,
      }));
    }

    return agentSteps.map((step) => ({ ...step, active: false }));
  }, [loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    
    setMessages((m) => [
      ...m,
      { role: "user", content: text },
      { role: "assistant", content: `Querying market intelligence agents and generating response for "${text}"...` }
    ]);
    setInput("");
    setLoading(true);

    try {
      // Trigger the global dashboard search context
      triggerSearch(text);

      // Call interactive AI Assistant chat endpoint
      const res = await sendAssistantChat(text);

      setMessages((m) => {
        const next = [...m];
        next[next.length - 1] = {
          role: "assistant",
          content: res.reply,
          chart: res.chart_data && res.chart_data.length > 0,
          chartData: res.chart_data
        };
        return next;
      });
    } catch (err: any) {
      setMessages((m) => {
        const next = [...m];
        next[next.length - 1] = {
          role: "assistant",
          content: `Sorry, I encountered an error while querying the agents: ${err.message || "Unknown error"}`
        };
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Ask questions in plain English. Get charts, tables and summaries.
          </p>
        </div>
        <Badge variant="secondary" className="gap-1.5">
          <Sparkles className="h-3 w-3 text-primary" /> Gemini 2.5 Flash
        </Badge>
      </div>

      <Card className="flex min-h-0 flex-1 flex-col shadow-soft">
        <CardContent className="flex-1 space-y-4 overflow-y-auto p-6">
          <div className="flex flex-wrap gap-2 rounded-xl border border-border/70 bg-background/70 p-2">
            {workflowPreview.map((step) => (
              <div
                key={step.name}
                className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                  step.active
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-transparent bg-muted/50 text-muted-foreground"
                }`}
              >
                <div className="font-medium">{step.name}</div>
                <div className="mt-0.5 text-[11px] opacity-80">{step.description}</div>
              </div>
            ))}
          </div>
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}
            >
              {m.role === "assistant" && (
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-hero text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-2xl rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p>{m.content}</p>
                {m.chart && (
                  <div className="mt-3 h-48 rounded-lg bg-background p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={m.chartData || categoryTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="category" stroke="var(--muted-foreground)" fontSize={11} />
                        <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            background: "var(--popover)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                        <Bar dataKey="value" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              {m.role === "user" && (
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
        </CardContent>
        <div className="border-t border-border p-4">
          {messages.length <= 1 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {starters.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products, brands, categories or claims…"
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

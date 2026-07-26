import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, workspace and notifications.
        </p>
      </div>
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>First name</Label>
            <Input defaultValue="Alex" />
          </div>
          <div className="space-y-1.5">
            <Label>Last name</Label>
            <Input defaultValue="Park" />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input defaultValue="alex@compete.iq" type="email" />
          </div>
          <div className="space-y-1.5">
            <Label>Company</Label>
            <Input defaultValue="Compete IQ" />
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">LLM & AI Configuration</CardTitle>
          <CardDescription>
            Configure OpenAI, Anthropic, or Gemini API keys in backend/.env for AI intent classification & claims extraction.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/40 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Backend LLM Client Status</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY in <code className="bg-muted px-1 py-0.5 rounded text-foreground">backend/.env</code>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Rule-based Fallback Active
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded border border-border bg-background p-2">
                <span className="text-muted-foreground">OpenAI API Key:</span>
                <span className="ml-1 font-semibold text-destructive">Not Set</span>
              </div>
              <div className="rounded border border-border bg-background p-2">
                <span className="text-muted-foreground">Anthropic Key:</span>
                <span className="ml-1 font-semibold text-destructive">Not Set</span>
              </div>
              <div className="rounded border border-border bg-background p-2">
                <span className="text-muted-foreground">Gemini Key:</span>
                <span className="ml-1 font-semibold text-destructive">Not Set</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>Choose which signals reach you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            "New product launches",
            "Pricing changes",
            "Packaging updates",
            "Competitor website updates",
            "Weekly digest email",
          ].map((n, i) => (
            <div key={n}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{n}</div>
                  <div className="text-xs text-muted-foreground">
                    Real-time in-app and email.
                  </div>
                </div>
                <Switch defaultChecked={i < 3} />
              </div>
              {i < 4 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            toast.success("Signed out");
            navigate({ to: "/" });
          }}
        >
          Sign out
        </Button>
        <Button onClick={() => toast.success("Settings saved")}>Save changes</Button>
      </div>
    </div>
  );
}

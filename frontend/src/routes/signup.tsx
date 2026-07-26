import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Radar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your workspace — Compete IQ" },
      {
        name: "description",
        content: "Start a 14-day free trial of Compete IQ.",
      },
      { property: "og:title", content: "Create your workspace — Compete IQ" },
      {
        property: "og:description",
        content: "Start a 14-day free trial of Compete IQ.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-hero lg:block">
        <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-background/20 text-primary-foreground backdrop-blur">
              <Radar className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold">Compete IQ</span>
          </Link>
          <div>
            <div className="text-3xl font-semibold leading-tight">
              Start monitoring competitors in minutes.
            </div>
            <ul className="mt-6 space-y-2 text-sm opacity-90">
              <li>• 14-day free trial, no card required</li>
              <li>• AI-extracted claims, ingredients & pricing</li>
              <li>• Real-time alerts for every competitor move</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Get started with a free workspace.
          </p>
          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setLoading(true);
              setTimeout(() => {
                toast.success("Workspace created");
                navigate({ to: "/app" });
              }, 600);
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="fn">First name</Label>
                <Input id="fn" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ln">Last name</Label>
                <Input id="ln" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="co">Company</Label>
                <Input id="co" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ti">Job title</Label>
                <Input id="ti" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="em">Work email</Label>
              <Input id="em" type="email" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pw">Password</Label>
                <Input id="pw" type="password" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cpw">Confirm</Label>
                <Input id="cpw" type="password" required />
              </div>
            </div>
            <div className="space-y-2 pt-1">
              <label className="flex items-start gap-2 text-sm">
                <Checkbox id="terms" required className="mt-0.5" />
                <span>I accept the Terms and Privacy Policy</span>
              </label>
              <label className="flex items-start gap-2 text-sm">
                <Checkbox id="updates" defaultChecked className="mt-0.5" />
                <span className="text-muted-foreground">
                  Send me product updates
                </span>
              </label>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

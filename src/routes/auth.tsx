import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import hero from "@/assets/hero-ocean.jpg";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

const credentials = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "Use at least 6 characters").max(72),
});

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Workplace AI Productivity Assistant" },
      {
        name: "description",
        content: "Sign in to your Workplace AI account to generate emails, plans and research.",
      },
      { property: "og:title", content: "Sign in — Workplace AI" },
      {
        property: "og:description",
        content: "Access your AI productivity hub for emails, planning, research and chat.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const destination = search.redirect?.startsWith("/") ? search.redirect : "/dashboard";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: destination, replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        navigate({ to: destination, replace: true });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [destination, navigate]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = credentials.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { full_name: fullName.trim() || null },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: destination, replace: true });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img
          src={hero}
          alt="Tropical lagoon with turquoise water and palm leaves"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-background/80 via-background/30 to-transparent" />
        <div className="glass absolute bottom-8 left-8 right-8 rounded-3xl p-6">
          <h2 className="text-lg font-semibold">Work calmer, ship faster</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            One hub for emails, plans, research and workplace questions.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="glass w-full max-w-md rounded-3xl p-6 sm:p-8">
          <Brand />
          <h1 className="mt-6 text-2xl font-semibold">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to reach your AI productivity tools."
              : "Start automating your everyday workplace tasks."}
          </p>

          {checkEmail ? (
            <div className="mt-6 space-y-4">
              <p className="rounded-2xl bg-background/50 p-4 text-sm">
                Check your inbox at <strong>{email}</strong> and click the confirmation link to
                finish creating your account.
              </p>
              <Button variant="outline" className="w-full rounded-2xl" onClick={() => setCheckEmail(false)}>
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={submit} className="mt-6 space-y-4">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      maxLength={80}
                      placeholder="Leilani Kealoha"
                      className="rounded-2xl bg-background/50"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Work email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    maxLength={255}
                    required
                    className="rounded-2xl bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    maxLength={72}
                    required
                    className="rounded-2xl bg-background/50"
                  />
                </div>
                <Button type="submit" className="w-full rounded-2xl" disabled={busy}>
                  {mode === "signin" ? "Sign in" : "Create account"}
                </Button>
              </form>

              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or
                <span className="h-px flex-1 bg-border" />
              </div>

              <Button
                variant="outline"
                className="w-full rounded-2xl"
                onClick={google}
                disabled={busy}
              >
                Continue with Google
              </Button>

              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="mt-5 w-full text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                {mode === "signin"
                  ? "New here? Create an account"
                  : "Already have an account? Sign in"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon, HeartIcon, LoaderCircleIcon } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type AuthMode = "sign-in" | "sign-up";

const COPY = {
  "sign-in": {
    title: "Welcome back",
    description: "Sign in to pick up where you left off.",
    submit: "Sign in",
    switchText: "New to WedPlan?",
    switchLabel: "Create an account",
    switchHref: "/sign-up",
  },
  "sign-up": {
    title: "Create your account",
    description: "Find trusted vendors and keep every detail in one place.",
    submit: "Create account",
    switchText: "Already have an account?",
    switchLabel: "Sign in",
    switchHref: "/sign-in",
  },
} as const satisfies Record<AuthMode, Record<string, string>>;

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const copy = COPY[mode];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const result =
        mode === "sign-up"
          ? await authClient.signUp.email({ name, email, password })
          : await authClient.signIn.email({ email, password });

      if (result.error) {
        setError(result.error.message ?? "Something went wrong. Please try again.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-primary/5 px-4 py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Link
            href="/"
            className="flex items-center gap-2 font-heading text-xl font-semibold tracking-tight"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <HeartIcon className="size-5" aria-hidden="true" />
            </span>
            <span>WedPlan</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Plan a wedding that feels like you.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{copy.title}</CardTitle>
            <CardDescription>{copy.description}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === "sign-up" ? (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Alex Morgan"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    minLength={2}
                    required
                  />
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                    placeholder="At least 8 characters"
                    className="pr-10"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={8}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute top-0 right-0 size-8 text-muted-foreground"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-4" aria-hidden="true" />
                    ) : (
                      <EyeIcon className="size-4" aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </div>

              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? (
                  <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                {copy.submit}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center border-t pt-4">
            <p className="text-center text-sm text-muted-foreground">
              {copy.switchText}{" "}
              <Link
                href={copy.switchHref}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {copy.switchLabel}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

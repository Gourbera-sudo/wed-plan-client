"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
import { signIn } from "@/lib/auth";

type AuthMode = "sign-in" | "sign-up";

const COPY = {
  "sign-in": {
    title: "Welcome back",
    description: "Sign in to pick up where you left off.",
    submit: "Sign In",
    footer: "New to WedPlan?",
    footerHref: "/sign-up",
    footerLink: "Create an account",
  },
  "sign-up": {
    title: "Create your account",
    description: "Start planning your wedding with WedPlan.",
    submit: "Sign Up",
    footer: "Already have an account?",
    footerHref: "/sign-in",
    footerLink: "Sign in",
  },
} satisfies Record<AuthMode, Record<string, string>>;

function nameFromEmail(email: string) {
  const handle = email.split("@")[0] ?? "";
  return handle
    .replace(/[._-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const copy = COPY[mode];

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const name =
      mode === "sign-up"
        ? String(data.get("name") ?? "").trim()
        : nameFromEmail(email);

    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }

    if (!name) {
      setError("Enter your name.");
      return;
    }

    setError(null);
    signIn({ name, email });
    router.push("/");
  }

  return (
    <div className="flex justify-center px-4 py-16 sm:py-24">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "sign-up" ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="Alex Morgan"
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
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                minLength={6}
                required
              />
            </div>

            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full">
              {copy.submit}
            </Button>

            <p className="text-xs text-muted-foreground">
              Demo authentication: this session is stored in your browser and no account is
              created.
            </p>
          </form>
        </CardContent>
        <CardFooter className="justify-center gap-1 text-sm text-muted-foreground">
          <span>{copy.footer}</span>
          <Link href={copy.footerHref} className="font-medium text-foreground underline-offset-4 hover:underline">
            {copy.footerLink}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

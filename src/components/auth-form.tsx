"use client";

import { cn } from "cn";
import {
  EyeIcon,
  EyeOffIcon,
  HeartIcon,
  ImagePlusIcon,
  LoaderCircleIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

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
import { toast } from "@/components/ui/toast";
import { clearApiToken } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

type AuthMode = "sign-in" | "sign-up";
type SignupRole = "customer" | "vendor";

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

type SocialProvider = "google" | "github";

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
const PASSWORD_ERROR =
  "Password must be at least 6 characters and include one uppercase and one lowercase letter.";

const ROLE_OPTIONS: {
  value: SignupRole;
  label: string;
  description: string;
}[] = [
  {
    value: "customer",
    label: "Customer",
    description: "Find and book wedding services",
  },
  {
    value: "vendor",
    label: "Vendor",
    description: "List and manage your services",
  },
];

function destinationFor(role?: string) {
  if (role === "admin") return "/admin";
  if (role === "vendor") return "/vendor";
  if (role === "customer") return "/customer";
  return "/dashboard";
}

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="size-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.42 7.42 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const copy = COPY[mode];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<SignupRole>("customer");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [socialPending, setSocialPending] = useState<SocialProvider | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  function handleImageChange(file: File | null) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (file) {
      previewUrlRef.current = URL.createObjectURL(file);
      setPreview(previewUrlRef.current);
    } else {
      setPreview(null);
    }

    setError(null);
    setProfileImage(file);
  }

  async function handleSocialSignIn(provider: SocialProvider) {
    setError(null);
    clearApiToken();
    setSocialPending(provider);

    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: "/dashboard",
      });

      if (result.error) {
        setError(result.error.message ?? "Unable to continue with this provider.");
        setSocialPending(null);
      }
    } catch {
      setError("Unable to connect. Please try again.");
      setSocialPending(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (mode === "sign-up" && !PASSWORD_RULE.test(password)) {
      setError(PASSWORD_ERROR);
      return;
    }

    setPending(true);
    clearApiToken();

    try {
      let image: string | undefined;

      if (mode === "sign-up" && profileImage) {
        setUploading(true);
        const uploadBody = new FormData();
        uploadBody.append("file", profileImage);

        const uploadResponse = await fetch("/api/upload/image", {
          method: "POST",
          body: uploadBody,
        });
        const uploadResult = (await uploadResponse.json()) as {
          url?: string;
          error?: string;
        };

        if (!uploadResponse.ok || !uploadResult.url) {
          setError(uploadResult.error ?? "The image could not be uploaded.");
          return;
        }

        image = uploadResult.url;
      }

      const result =
        mode === "sign-up"
          ? await authClient.signUp.email({
              name,
              email,
              password,
              image,
              signupRole: role,
            })
          : await authClient.signIn.email({ email, password });

      if (result.error) {
        setError(result.error.message ?? "Something went wrong. Please try again.");
        return;
      }

      toast.add({
        title: mode === "sign-up" ? "Account created" : "Welcome back",
        description:
          mode === "sign-up"
            ? "Your WedPlan account is ready."
            : "You are signed in to WedPlan.",
        type: "success",
      });

      const signedInRole = (result.data?.user as { role?: string } | undefined)
        ?.role;
      router.push(destinationFor(signedInRole ?? role));
      router.refresh();
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setUploading(false);
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
                <>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your Name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      minLength={2}
                      required
                    />
                  </div>

                  <fieldset className="flex flex-col gap-2">
                    <legend className="text-sm font-medium">Account role</legend>
                    <div className="grid grid-cols-2 gap-2">
                      {ROLE_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className={cn(
                            "flex cursor-pointer flex-col rounded-lg border p-3 text-sm transition",
                            role === option.value
                              ? "border-primary bg-primary/5 ring-1 ring-primary"
                              : "border-input hover:bg-muted/50",
                          )}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={option.value}
                            checked={role === option.value}
                            onChange={() => {
                              setError(null);
                              setRole(option.value);
                            }}
                            className="sr-only"
                          />
                          <span className="font-medium">{option.label}</span>
                          <span className="mt-0.5 text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </>
              ) : null}

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Your Email"
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
                    autoComplete={
                      mode === "sign-up" ? "new-password" : "current-password"
                    }
                    placeholder="At least 6 characters"
                    className="pr-10"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={mode === "sign-up" ? 6 : undefined}
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
                {mode === "sign-up" ? (
                  <p className="text-xs text-muted-foreground">
                    6+ characters, with one uppercase and one lowercase letter.
                  </p>
                ) : null}
              </div>

              {mode === "sign-up" ? (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="profileImage">Profile image (optional)</Label>
                  <Input
                    ref={fileInputRef}
                    id="profileImage"
                    name="profileImage"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(event) =>
                      handleImageChange(event.target.files?.[0] ?? null)
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, WEBP or GIF up to 5 MB.
                  </p>
                  {preview ? (
                    <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-2">
                      <span
                        aria-hidden="true"
                        className="size-10 shrink-0 rounded-full bg-cover bg-center ring-1 ring-foreground/10"
                        style={{ backgroundImage: `url("${preview}")` }}
                      />
                      <span className="min-w-0 flex-1 truncate text-xs">
                        {profileImage?.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          handleImageChange(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <Button
                type="submit"
                className="w-full"
                disabled={pending || uploading || socialPending !== null}
              >
                {uploading ? (
                  <ImagePlusIcon className="size-4 animate-pulse" aria-hidden="true" />
                ) : pending ? (
                  <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                {uploading
                  ? "Uploading image…"
                  : pending
                    ? mode === "sign-up"
                      ? "Creating account…"
                      : "Signing in…"
                    : copy.submit}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              <span>or continue with</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={pending || uploading || socialPending !== null}
                onClick={() => handleSocialSignIn("google")}
              >
                {socialPending === "google" ? (
                  <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <GoogleIcon />
                )}
                Sign in with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={pending || uploading || socialPending !== null}
                onClick={() => handleSocialSignIn("github")}
              >
                {socialPending === "github" ? (
                  <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <GitHubIcon />
                )}
                Sign in with GitHub
              </Button>
            </div>
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

"use client";

import { LogOutIcon, LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function handleSignOut() {
    setError(false);
    setPending(true);

    try {
      const result = await authClient.signOut();
      if (result.error) {
        setError(true);
        return;
      }

      router.replace("/sign-in");
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        disabled={pending}
      >
        {pending ? (
          <LoaderCircleIcon className="size-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <LogOutIcon className="size-3.5" aria-hidden="true" />
        )}
        Sign out
      </Button>
      {error ? <span className="text-xs text-destructive">Sign out failed</span> : null}
    </div>
  );
}

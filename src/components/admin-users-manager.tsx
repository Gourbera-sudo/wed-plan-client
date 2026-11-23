"use client";

import { LoaderCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";

type ManagedUser = {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "vendor" | "admin";
  isBlocked?: boolean;
  banned?: boolean;
  subscriptionPlan?: "free" | "premium";
  businessName?: string;
  createdAt?: string;
};

type UserRow = ManagedUser & {
  draftRole: "customer" | "vendor" | "admin";
  draftPlan: "free" | "premium";
  draftBusiness: string;
};

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function toRow(user: ManagedUser): UserRow {
  return {
    ...user,
    draftRole: user.role,
    draftPlan: user.subscriptionPlan ?? "free",
    draftBusiness: user.businessName ?? "",
  };
}

/** Admin-only account management: roles, blocking, plans, and business names. */
export function AdminUsersManager({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await apiFetch<{ users: ManagedUser[] }>("/api/admin/users");
        if (!cancelled) setUsers((data.users ?? []).map(toRow));
      } catch (loadError) {
        if (!cancelled) setError(messageOf(loadError));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  function updateRow(id: string, changes: Partial<UserRow>) {
    setUsers((current) =>
      current.map((user) => (user._id === id ? { ...user, ...changes } : user)),
    );
  }

  async function save(user: UserRow) {
    setBusyId(user._id);
    setError(null);
    try {
      const data = await apiFetch<{ user: ManagedUser }>(
        `/api/admin/users/${user._id}`,
        {
          method: "PATCH",
          body: {
            role: user.draftRole,
            subscriptionPlan: user.draftPlan,
            businessName: user.draftBusiness,
          },
        },
      );
      setUsers((current) =>
        current.map((row) => (row._id === user._id ? toRow(data.user) : row)),
      );
      toast.add({
        title: "User updated",
        description: `${user.name}'s account was updated.`,
        type: "success",
      });
    } catch (saveError) {
      const text = messageOf(saveError);
      setError(text);
      toast.add({ title: "Could not update", description: text, type: "error" });
    } finally {
      setBusyId(null);
    }
  }

  async function toggleBlock(user: UserRow) {
    setBusyId(user._id);
    setError(null);
    const blocked = !(user.isBlocked || user.banned);
    try {
      const data = await apiFetch<{ user: ManagedUser }>(
        `/api/admin/users/${user._id}`,
        { method: "PATCH", body: { isBlocked: blocked } },
      );
      setUsers((current) =>
        current.map((row) => (row._id === user._id ? toRow(data.user) : row)),
      );
      toast.add({
        title: blocked ? "User blocked" : "User unblocked",
        description: `${user.name} can ${blocked ? "no longer" : "now"} sign in.`,
        type: "success",
      });
    } catch (blockError) {
      const text = messageOf(blockError);
      setError(text);
      toast.add({ title: "Could not update", description: text, type: "error" });
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading users…</p>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => {
        const self = user._id === currentUserId;
        const blocked = Boolean(user.isBlocked || user.banned);
        const busy = busyId === user._id;

        return (
          <Card key={user._id}>
            <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{user.role}</Badge>
                <Badge variant={user.subscriptionPlan === "premium" ? "default" : "secondary"}>
                  {user.subscriptionPlan ?? "free"}
                </Badge>
                {blocked ? <Badge variant="destructive">Blocked</Badge> : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor={`role-${user._id}`}>Role</Label>
                  <select
                    id={`role-${user._id}`}
                    value={user.draftRole}
                    disabled={self}
                    onChange={(event) =>
                      updateRow(user._id, {
                        draftRole: event.target.value as UserRow["draftRole"],
                      })
                    }
                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60"
                  >
                    <option value="customer">Customer</option>
                    <option value="vendor">Vendor</option>
                  </select>
                  {self ? (
                    <p className="text-xs text-muted-foreground">
                      Your own role is fixed.
                    </p>
                  ) : null}
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`plan-${user._id}`}>Plan</Label>
                  <select
                    id={`plan-${user._id}`}
                    value={user.draftPlan}
                    onChange={(event) =>
                      updateRow(user._id, {
                        draftPlan: event.target.value as UserRow["draftPlan"],
                      })
                    }
                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`business-${user._id}`}>Business name</Label>
                  <Input
                    id={`business-${user._id}`}
                    value={user.draftBusiness}
                    onChange={(event) =>
                      updateRow(user._id, { draftBusiness: event.target.value })
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  disabled={busy}
                  onClick={() => void save(user)}
                >
                  {busy ? (
                    <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
                  ) : null}
                  Save changes
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={blocked ? "outline" : "destructive"}
                  disabled={busy || self}
                  onClick={() => void toggleBlock(user)}
                >
                  {blocked ? "Unblock" : "Block"}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

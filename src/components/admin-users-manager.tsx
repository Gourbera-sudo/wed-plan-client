"use client";

import { EyeIcon, LoaderCircleIcon, SearchIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  bio?: string;
  phone?: string;
  image?: string;
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

const ROLE_LABELS: Record<string, string> = {
  all: "All roles",
  customer: "Customer",
  vendor: "Vendor",
  admin: "Admin",
};

function toRow(user: ManagedUser): UserRow {
  return {
    ...user,
    draftRole: user.role,
    draftPlan: user.subscriptionPlan ?? "free",
    draftBusiness: user.businessName ?? "",
  };
}

function joinedLabel(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN");
}

/** Admin-only account management: search, details, roles, blocking, and plans. */
export function AdminUsersManager({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ManagedUser | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter(
      (user) =>
        (!term ||
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)) &&
        (roleFilter === "all" || user.role === roleFilter),
    );
  }, [users, search, roleFilter]);

  function updateRow(id: string, changes: Partial<UserRow>) {
    setUsers((current) =>
      current.map((user) => (user._id === id ? { ...user, ...changes } : user)),
    );
  }

  async function showDetails(user: UserRow) {
    if (expandedId === user._id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(user._id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const data = await apiFetch<{ user: ManagedUser }>(
        `/api/admin/users/${user._id}`,
      );
      setDetail(data.user);
    } catch (detailError) {
      setError(messageOf(detailError));
    } finally {
      setDetailLoading(false);
    }
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
      if (expandedId === user._id) setDetail(data.user);
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
      if (expandedId === user._id) setDetail(data.user);
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

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl bg-secondary/50 p-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="admin-user-search">Search users</Label>
          <div className="relative">
            <SearchIcon
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="admin-user-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name or email"
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="admin-user-role">Role</Label>
          <Select
            value={roleFilter}
            onValueChange={(value) => setRoleFilter(value ?? "all")}
          >
            <SelectTrigger id="admin-user-role" className="w-full">
              <SelectValue>
                {(value) => ROLE_LABELS[String(value)] ?? String(value)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="vendor">Vendor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {visible.length} of {users.length} users
      </p>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {visible.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No users match your search.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((user) => {
            const self = user._id === currentUserId;
            const blocked = Boolean(user.isBlocked || user.banned);
            const busy = busyId === user._id;
            const expanded = expandedId === user._id;

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
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => void showDetails(user)}
                    >
                      {detailLoading && expanded ? (
                        <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <EyeIcon className="size-4" aria-hidden="true" />
                      )}
                      {expanded ? "Hide details" : "View details"}
                    </Button>
                  </div>
                </CardHeader>

                {expanded ? (
                  <div className="border-y bg-muted/30 px-4 py-3 text-sm">
                    {detailLoading ? (
                      <p className="text-muted-foreground">Loading account details…</p>
                    ) : detail ? (
                      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                        <div>
                          <dt className="text-xs text-muted-foreground">Name</dt>
                          <dd className="font-medium">{detail.name}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Email</dt>
                          <dd className="break-all font-medium">{detail.email}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Role</dt>
                          <dd className="font-medium">{detail.role}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Business</dt>
                          <dd className="font-medium">{detail.businessName || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Phone</dt>
                          <dd className="font-medium">{detail.phone || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted-foreground">Joined</dt>
                          <dd className="font-medium">{joinedLabel(detail.createdAt)}</dd>
                        </div>
                        {detail.bio ? (
                          <div className="sm:col-span-2">
                            <dt className="text-xs text-muted-foreground">About</dt>
                            <dd className="whitespace-pre-line">{detail.bio}</dd>
                          </div>
                        ) : null}
                      </dl>
                    ) : null}
                  </div>
                ) : null}

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
      )}
    </div>
  );
}

"use client";

import {
  CheckIcon,
  LoaderCircleIcon,
  PauseIcon,
  PlayIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { revalidateServices } from "@/app/actions/revalidate";
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
import { SERVICE_CATEGORY_ORDER } from "@/lib/service-constants";

type ManagedService = {
  _id: string;
  name: string;
  category: string;
  location: string;
  price: number;
  image?: string;
  images?: string[];
  vendorName?: string;
  isApproved: boolean;
  isActive: boolean;
  status?: string;
};

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function stateOf(service: ManagedService) {
  if (!service.isApproved) {
    return service.status === "rejected"
      ? { label: "Rejected", variant: "destructive" as const, key: "rejected" }
      : { label: "Pending", variant: "outline" as const, key: "pending" };
  }
  return service.isActive
    ? { label: "Live", variant: "default" as const, key: "approved" }
    : { label: "Paused", variant: "secondary" as const, key: "paused" };
}

const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const STATUS_LABELS: Record<string, string> = {
  all: "All statuses",
  pending: "Pending",
  approved: "Live",
  paused: "Paused",
  rejected: "Rejected",
};

export function AdminServicesManager() {
  const [services, setServices] = useState<ManagedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await apiFetch<{ services: ManagedService[] }>(
          "/api/admin/services",
        );
        if (!cancelled) setServices(data.services ?? []);
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
    return services.filter((service) => {
      const matchesSearch =
        !term ||
        [service.name, service.vendorName, service.location]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));
      const matchesCategory =
        category === "all" || service.category === category;
      const matchesState =
        stateFilter === "all" || stateOf(service).key === stateFilter;
      return matchesSearch && matchesCategory && matchesState;
    });
  }, [services, search, category, stateFilter]);

  async function moderate(service: ManagedService, action: "approve" | "reject") {
    setBusyId(service._id);
    setError(null);
    try {
      const data = await apiFetch<{ service: ManagedService }>(
        `/api/admin/services/${service._id}`,
        { method: "PATCH", body: { action } },
      );
      setServices((current) =>
        current.map((item) =>
          item._id === service._id ? { ...item, ...data.service } : item,
        ),
      );
      await revalidateServices();
      toast.add({
        title: action === "approve" ? "Service approved" : "Service rejected",
        description: `"${service.name}" is now ${
          action === "approve" ? "live" : "hidden from browse"
        }.`,
        type: "success",
      });
    } catch (moderateError) {
      const text = messageOf(moderateError);
      setError(text);
      toast.add({ title: "Could not review", description: text, type: "error" });
    } finally {
      setBusyId(null);
    }
  }

  async function toggleStatus(service: ManagedService) {
    setBusyId(service._id);
    setError(null);
    try {
      const data = await apiFetch<{ service: ManagedService }>(
        `/api/admin/services/${service._id}/status`,
        { method: "PATCH", body: { isActive: !service.isActive } },
      );
      setServices((current) =>
        current.map((item) =>
          item._id === service._id ? { ...item, ...data.service } : item,
        ),
      );
      await revalidateServices();
      toast.add({
        title: data.service.isActive ? "Service activated" : "Service paused",
        description: `"${service.name}" is ${
          data.service.isActive ? "available again" : "hidden from browse"
        }.`,
        type: "success",
      });
    } catch (statusError) {
      const text = messageOf(statusError);
      setError(text);
      toast.add({ title: "Could not change status", description: text, type: "error" });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(service: ManagedService) {
    if (
      !window.confirm(
        `Delete "${service.name}"? This removes the listing permanently.`,
      )
    ) {
      return;
    }
    setBusyId(service._id);
    setError(null);
    try {
      await apiFetch(`/api/admin/services/${service._id}`, { method: "DELETE" });
      setServices((current) => current.filter((item) => item._id !== service._id));
      await revalidateServices();
      toast.add({
        title: "Service deleted",
        description: `"${service.name}" was removed.`,
        type: "success",
      });
    } catch (deleteError) {
      const text = messageOf(deleteError);
      setError(text);
      toast.add({ title: "Could not delete", description: text, type: "error" });
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading services…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl bg-secondary/50 p-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="admin-service-search">Search services</Label>
          <div className="relative">
            <SearchIcon
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="admin-service-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, vendor, or location"
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="admin-service-category">Category</Label>
          <Select
            value={category}
            onValueChange={(value) => setCategory(value ?? "all")}
          >
            <SelectTrigger id="admin-service-category" className="w-full">
              <SelectValue>
                {(value) => (value === "all" ? "All categories" : String(value))}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {SERVICE_CATEGORY_ORDER.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="admin-service-state">Status</Label>
          <Select
            value={stateFilter}
            onValueChange={(value) => setStateFilter(value ?? "all")}
          >
            <SelectTrigger id="admin-service-state" className="w-full">
              <SelectValue>
                {(value) => STATUS_LABELS[String(value)] ?? String(value)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Live</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {visible.length} of {services.length} services
      </p>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {visible.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {services.length === 0
              ? "No services have been submitted yet."
              : "No services match your filters."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visible.map((service) => {
            const state = stateOf(service);
            const cover = service.images?.[0] ?? service.image;
            const busy = busyId === service._id;

            return (
              <Card key={service._id}>
                <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    {cover ? (
                      <Image
                        src={cover}
                        alt=""
                        width={56}
                        height={56}
                        unoptimized
                        className="size-14 shrink-0 rounded-lg object-cover"
                      />
                    ) : null}
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base">{service.name}</CardTitle>
                      <CardDescription className="truncate">
                        {service.vendorName ?? "Unknown vendor"} · {service.category} ·{" "}
                        {service.location}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={state.variant}>{state.label}</Badge>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium">{priceFormatter.format(service.price)}</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={busy}
                      onClick={() => void moderate(service, "approve")}
                    >
                      {busy ? (
                        <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <CheckIcon className="size-4" aria-hidden="true" />
                      )}
                      Approve
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => void moderate(service, "reject")}
                    >
                      <XIcon className="size-4" aria-hidden="true" />
                      Reject
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => void toggleStatus(service)}
                    >
                      {service.isActive ? (
                        <PauseIcon className="size-4" aria-hidden="true" />
                      ) : (
                        <PlayIcon className="size-4" aria-hidden="true" />
                      )}
                      {service.isActive ? "Pause" : "Activate"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={busy}
                      onClick={() => void remove(service)}
                    >
                      <Trash2Icon className="size-4" aria-hidden="true" />
                      Delete
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

"use client";

import { CheckIcon, LoaderCircleIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

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
import { toast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";

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
      ? { label: "Rejected", variant: "destructive" as const }
      : { label: "Pending", variant: "outline" as const };
  }
  return service.isActive
    ? { label: "Live", variant: "default" as const }
    : { label: "Paused", variant: "secondary" as const };
}

export function AdminServicesManager() {
  const [services, setServices] = useState<ManagedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

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

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading services…</p>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No services have been submitted yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {services.map((service) => {
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
              <p className="text-sm font-medium">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(service.price)}
              </p>
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
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

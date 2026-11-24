"use client";

import {
  LoaderCircleIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { revalidateServices } from "@/app/actions/revalidate";
import { ButtonLink } from "@/components/button-link";
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
  isApproved: boolean;
  isActive: boolean;
  status?: string;
};

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function statusOf(service: ManagedService) {
  if (service.status === "rejected") return { label: "Rejected", variant: "destructive" as const };
  if (!service.isApproved) return { label: "Pending review", variant: "outline" as const };
  if (!service.isActive) return { label: "Paused", variant: "secondary" as const };
  return { label: "Live", variant: "default" as const };
}

const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function VendorServicesManager() {
  const [services, setServices] = useState<ManagedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await apiFetch<{ services: ManagedService[] }>(
          "/api/vendor/services",
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

  async function toggleAvailability(service: ManagedService) {
    setBusyId(service._id);
    setError(null);
    try {
      const data = await apiFetch<{ service: ManagedService }>(
        `/api/vendor/services/${service._id}`,
        { method: "PUT", body: { isActive: !service.isActive } },
      );
      setServices((current) =>
        current.map((item) =>
          item._id === service._id ? { ...item, ...data.service } : item,
        ),
      );
      await revalidateServices();
      toast.add({
        title: data.service.isActive ? "Service reactivated" : "Service paused",
        description: `"${service.name}" is ${
          data.service.isActive ? "available again" : "hidden from browse"
        }.`,
        type: "success",
      });
    } catch (availabilityError) {
      const text = messageOf(availabilityError);
      setError(text);
      toast.add({ title: "Could not update availability", description: text, type: "error" });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(service: ManagedService) {
    if (!window.confirm(`Delete "${service.name}"? This cannot be undone.`)) return;
    setBusyId(service._id);
    setError(null);
    try {
      await apiFetch(`/api/vendor/services/${service._id}`, { method: "DELETE" });
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
    return <p className="text-sm text-muted-foreground">Loading your services…</p>;
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
        <CardContent className="space-y-3 py-10 text-center">
          <p className="text-muted-foreground">
            You haven&apos;t added any services yet.
          </p>
          <ButtonLink href="/vendor/services/new">Add your first service</ButtonLink>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {services.map((service) => {
        const status = statusOf(service);
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
                    {service.category} · {service.location}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={status.variant}>{status.label}</Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium">
                {priceFormatter.format(service.price)}
              </p>
              <div className="flex flex-wrap gap-2">
                <ButtonLink href={`/services/${service._id}`} variant="outline" size="sm">
                  View
                </ButtonLink>
                <ButtonLink
                  href={`/vendor/services/${service._id}/edit`}
                  variant="outline"
                  size="sm"
                >
                  <PencilIcon className="size-4" aria-hidden="true" />
                  Edit
                </ButtonLink>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => void toggleAvailability(service)}
                >
                  {busy ? (
                    <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
                  ) : service.isActive ? (
                    <PauseIcon className="size-4" aria-hidden="true" />
                  ) : (
                    <PlayIcon className="size-4" aria-hidden="true" />
                  )}
                  {service.isActive ? "Pause" : "Activate"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={busy}
                  onClick={() => void remove(service)}
                >
                  {busy ? (
                    <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2Icon className="size-4" aria-hidden="true" />
                  )}
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

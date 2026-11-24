"use client";

import { ImagePlusIcon, LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

import { revalidateServices } from "@/app/actions/revalidate";
import { ButtonLink } from "@/components/button-link";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/api";
import { SERVICE_CATEGORY_ORDER } from "@/lib/service-constants";

type EditableService = {
  _id: string;
  name: string;
  category: string;
  description?: string;
  location: string;
  price: number;
  image?: string;
  images?: string[];
  isActive?: boolean;
  eventTypes?: string[];
  availability?: string[];
};

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

/** Vendor listing form. New listings always start pending admin approval. */
export function ServiceForm({ serviceId }: { serviceId?: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(SERVICE_CATEGORY_ORDER[0]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [images, setImages] = useState("");
  const [eventTypes, setEventTypes] = useState("");
  const [availability, setAvailability] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(Boolean(serviceId));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) return;
    let cancelled = false;

    async function load() {
      try {
        const data = await apiFetch<{ services: EditableService[] }>(
          "/api/vendor/services",
        );
        const service = data.services.find((item) => item._id === serviceId);
        if (!service) throw new Error("This service could not be found.");
        if (cancelled) return;

        const cover = service.image || service.images?.[0] || "";
        setName(service.name);
        setCategory(service.category);
        setDescription(service.description ?? "");
        setLocation(service.location);
        setPrice(String(service.price));
        setImage(cover);
        setImages(
          (service.images ?? []).filter((url) => url !== cover).join("\n"),
        );
        setEventTypes((service.eventTypes ?? []).join("\n"));
        setAvailability((service.availability ?? []).join("\n"));
        setIsActive(service.isActive !== false);
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
  }, [serviceId]);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: form,
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "The image could not be uploaded.");
      }
      setImage(data.url);
    } catch (uploadError) {
      setError(messageOf(uploadError));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const extraImages = images
        .split(/[\n,]/)
        .map((url) => url.trim())
        .filter(Boolean);
      const body = {
        name: name.trim(),
        category,
        description: description.trim(),
        location: location.trim(),
        price: Number(price),
        image: image.trim(),
        images: extraImages,
        eventTypes: eventTypes
          .split("\n")
          .map((value) => value.trim())
          .filter(Boolean),
        availability: availability
          .split("\n")
          .map((value) => value.trim())
          .filter(Boolean),
        isActive,
      };

      if (serviceId) {
        await apiFetch(`/api/vendor/services/${serviceId}`, {
          method: "PUT",
          body,
        });
        await revalidateServices();
        toast.add({
          title: "Service updated",
          description:
            "Changes to service details are sent back to admin review. Availability changes apply immediately.",
          type: "success",
        });
      } else {
        await apiFetch("/api/vendor/services", { method: "POST", body });
        await revalidateServices();
        toast.add({
          title: "Service submitted",
          description: "Your listing will appear publicly once an admin approves it.",
          type: "success",
        });
      }
      router.push("/vendor/services");
    } catch (submitError) {
      const text = messageOf(submitError);
      setError(text);
      toast.add({
        title: serviceId ? "Could not update service" : "Could not save service",
        description: text,
        type: "error",
      });
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading service…</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">
          {serviceId ? "Edit service" : "New service"}
        </CardTitle>
        <CardDescription>
          {serviceId
            ? "Update the details couples see. Content changes must be approved again before the listing goes live."
            : "Tell couples what you offer. An admin reviews every listing before it goes live."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-5">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="service-name">Service name</Label>
              <Input
                id="service-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Golden Hour Photography"
                required
                minLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-category">Category</Label>
              <select
                id="service-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {SERVICE_CATEGORY_ORDER.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-price">Price (INR)</Label>
              <Input
                id="service-price"
                type="number"
                min={0}
                step={1}
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="25000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-location">Location</Label>
              <Input
                id="service-location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Jaipur, Rajasthan"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-description">Description</Label>
            <Textarea
              id="service-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What's included, your style, and what makes it special."
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-image">Cover image URL</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="service-image"
                value={image}
                onChange={(event) => setImage(event.target.value)}
                placeholder="https://…"
                className="min-w-0 flex-1"
              />
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(event) => void onFileChange(event)}
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ImagePlusIcon className="size-4" aria-hidden="true" />
                )}
                {uploading ? "Uploading…" : "Upload"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a photo or paste a hosted image URL.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service-gallery">Additional images</Label>
            <Textarea
              id="service-gallery"
              value={images}
              onChange={(event) => setImages(event.target.value)}
              placeholder="One URL per line"
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="service-event-types">Event types</Label>
              <Textarea
                id="service-event-types"
                value={eventTypes}
                onChange={(event) => setEventTypes(event.target.value)}
                placeholder={"Wedding ceremony\nReception\nMehendi"}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">One per line.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-availability">Availability notes</Label>
              <Textarea
                id="service-availability"
                value={availability}
                onChange={(event) => setAvailability(event.target.value)}
                placeholder={"Weekends and weekdays\nAdvance booking required"}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Shown to couples before they request a date.
              </p>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="mt-0.5 size-4 accent-[var(--primary)]"
            />
            <span>
              <span className="font-medium">Available for bookings</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Pause a service to hide it from couples without deleting it.
              </span>
            </span>
          </label>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={saving || uploading}>
              {saving ? (
                <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {saving
                ? serviceId
                  ? "Saving…"
                  : "Submitting…"
                : serviceId
                  ? "Save changes"
                  : "Submit service"}
            </Button>
            <ButtonLink href="/vendor/services" variant="outline">
              Cancel
            </ButtonLink>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

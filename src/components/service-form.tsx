"use client";

import { ImagePlusIcon, LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

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

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

/** Vendor listing form. New listings always start pending admin approval. */
export function ServiceForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(SERVICE_CATEGORY_ORDER[0]);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [images, setImages] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      await apiFetch("/api/vendor/services", {
        method: "POST",
        body: {
          name: name.trim(),
          category,
          description: description.trim(),
          location: location.trim(),
          price: Number(price),
          image: image.trim(),
          images: extraImages,
        },
      });
      await revalidateServices();
      toast.add({
        title: "Service submitted",
        description: "Your listing will appear publicly once an admin approves it.",
        type: "success",
      });
      router.push("/vendor/services");
    } catch (submitError) {
      const text = messageOf(submitError);
      setError(text);
      toast.add({ title: "Could not save service", description: text, type: "error" });
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">New service</CardTitle>
        <CardDescription>
          Tell couples what you offer. An admin reviews every listing before it goes live.
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

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={saving || uploading}>
              {saving ? (
                <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {saving ? "Submitting…" : "Submit service"}
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

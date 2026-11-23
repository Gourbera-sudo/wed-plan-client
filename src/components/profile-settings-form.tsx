"use client";

import { ImagePlusIcon, LoaderCircleIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

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

export type ProfileValues = {
  name: string;
  email: string;
  image?: string | null;
  bio?: string | null;
  phone?: string | null;
  businessName?: string | null;
};

function messageOf(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

/** Shared profile editor for the private, customer, vendor, and admin areas. */
export function ProfileSettingsForm({
  initial,
  showBusinessName = false,
}: {
  initial: ProfileValues;
  showBusinessName?: boolean;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [businessName, setBusinessName] = useState(initial.businessName ?? "");
  const [image, setImage] = useState(initial.image ?? "");
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
      toast.add({
        title: "Photo uploaded",
        description: "Save your profile to apply the new photo.",
        type: "success",
      });
    } catch (uploadError) {
      setError(messageOf(uploadError));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, string> = { name, phone, bio, image };
      if (showBusinessName) body.businessName = businessName;

      await apiFetch("/api/profile", { method: "PATCH", body });
      toast.add({
        title: "Profile updated",
        description: "Your changes have been saved.",
        type: "success",
      });
      router.refresh();
    } catch (saveError) {
      const text = messageOf(saveError);
      setError(text);
      toast.add({ title: "Could not save", description: text, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">Profile details</CardTitle>
        <CardDescription>
          Update how your name and photo appear across WedPlan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={save} className="space-y-5">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <div className="flex items-center gap-4">
            {image ? (
              <Image
                src={image}
                alt=""
                width={64}
                height={64}
                unoptimized
                className="size-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary">
                {initial.name.trim().charAt(0).toUpperCase() || "?"}
              </div>
            )}
            <div>
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
                size="sm"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                {uploading ? (
                  <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ImagePlusIcon className="size-4" aria-hidden="true" />
                )}
                {uploading ? "Uploading…" : "Change photo"}
              </Button>
              <p className="mt-1 text-xs text-muted-foreground">
                JPG, PNG, WEBP or GIF, up to 5 MB.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full name</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                minLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" value={initial.email} disabled readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-phone">Phone</Label>
              <Input
                id="profile-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Optional"
              />
            </div>
            {showBusinessName ? (
              <div className="space-y-2">
                <Label htmlFor="profile-business">Business name</Label>
                <Input
                  id="profile-business"
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  placeholder="Your studio or company"
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-bio">About you</Label>
            <Textarea
              id="profile-bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Tell couples a little about yourself."
              rows={4}
              maxLength={1000}
            />
          </div>

          <Button type="submit" disabled={saving || uploading}>
            {saving ? (
              <LoaderCircleIcon className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

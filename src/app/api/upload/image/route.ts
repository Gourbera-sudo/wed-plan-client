const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

type ImgBBResponse = {
  data?: { url?: string; delete_url?: string };
  error?: { message?: string };
};

/**
 * Proxies profile image uploads to ImgBB so the API key stays server-side.
 * The sign-up form is public, so this endpoint validates the file itself.
 */
export async function POST(request: Request) {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error:
          "Profile image uploads are not configured yet. Please ask the site owner to add an ImgBB API key, or sign up without a photo.",
      },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Choose an image to upload." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json(
      { error: "Use a JPG, PNG, WEBP, or GIF image." },
      { status: 400 },
    );
  }
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
    return Response.json(
      { error: "The image must be smaller than 5 MB." },
      { status: 400 },
    );
  }

  const upload = new FormData();
  upload.append("key", apiKey);
  upload.append("image", file, file.name || "profile-image");
  upload.append("name", file.name.replace(/\.[^.]+$/, "").slice(0, 60) || "avatar");

  try {
    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: upload,
      signal: AbortSignal.timeout(20_000),
      cache: "no-store",
    });
    const payload = (await response.json()) as ImgBBResponse;

    if (!response.ok || !payload.data?.url) {
      return Response.json(
        { error: payload.error?.message ?? "The image could not be uploaded." },
        { status: 502 },
      );
    }

    return Response.json({
      url: payload.data.url,
      deleteUrl: payload.data.delete_url,
    });
  } catch {
    return Response.json(
      { error: "The image service is unavailable. Please try again." },
      { status: 502 },
    );
  }
}

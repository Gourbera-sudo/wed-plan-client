"use server";

import { revalidateTag } from "next/cache";

/**
 * Expire the cached public service listings immediately after a listing is
 * created, deleted, or moderated. The single-argument form is deprecated in
 * Next 16, so pass an explicit cache profile.
 */
export async function revalidateServices() {
  revalidateTag("services", { expire: 0 });
}

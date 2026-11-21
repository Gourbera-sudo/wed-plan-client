"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth-guards";
import { getDatabase } from "@/lib/mongodb";
import { getServiceById } from "@/lib/services";

export type BookingFormState = {
  ok: boolean;
  message: string;
} | null;

const ACTIVE_STATUSES = ["Pending", "Accepted"] as const;

/**
 * Creates a pending booking request. Role, ownership, service availability,
 * input, duplicate, and date checks all run here — never in the browser.
 */
export async function submitBookingRequest(
  _previousState: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const user = await requireUser();

  if (user.role === "admin") {
    return { ok: false, message: "Admins cannot submit customer booking requests." };
  }
  if (user.role === "vendor") {
    return { ok: false, message: "Vendors cannot book services." };
  }

  const serviceId = String(formData.get("serviceId") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "").trim();
  const eventLocation = String(formData.get("eventLocation") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
    return { ok: false, message: "Please choose a valid event date." };
  }
  if (eventLocation.length < 3 || eventLocation.length > 200) {
    return { ok: false, message: "Please enter an event location (3–200 characters)." };
  }
  if (message.length > 1000) {
    return { ok: false, message: "Your message must be 1000 characters or fewer." };
  }

  const bookedFor = new Date(`${eventDate}T00:00:00.000Z`);
  if (Number.isNaN(bookedFor.getTime())) {
    return { ok: false, message: "Please choose a valid event date." };
  }
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (bookedFor < today) {
    return { ok: false, message: "The event date must be today or later." };
  }

  const service = await getServiceById(serviceId);
  if (!service) {
    return { ok: false, message: "This service is no longer available for booking." };
  }
  if (service.vendorId && service.vendorId === user.id) {
    return { ok: false, message: "You cannot book your own service." };
  }

  const bookings = getDatabase().collection("bookings");
  const duplicate = await bookings.findOne({
    serviceId,
    customerId: user.id,
    eventDate: bookedFor,
    status: { $in: [...ACTIVE_STATUSES] },
  });
  if (duplicate) {
    return {
      ok: false,
      message: "You already have an active request for this service on that date.",
    };
  }

  await bookings.insertOne({
    serviceId,
    vendorId: service.vendorId,
    customerId: user.id,
    serviceName: service.name,
    eventDate: bookedFor,
    eventLocation,
    message,
    status: "Pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath(`/services/${serviceId}`);

  return {
    ok: true,
    message: "Request sent. You can follow its status in your dashboard.",
  };
}

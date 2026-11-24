import { ServiceForm } from "@/components/service-form";

export const metadata = {
  title: "Edit Service",
};

export default async function EditServicePage({
  params,
}: PageProps<"/vendor/services/[id]/edit">) {
  const { id } = await params;
  return <ServiceForm serviceId={id} />;
}

import {
  Building2Icon,
  CameraIcon,
  Flower2Icon,
  ShirtIcon,
  SparklesIcon,
  UtensilsCrossedIcon,
  type LucideIcon,
} from "lucide-react";

/** Shared icon map for category cards and category detail pages. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Photography & Videography": CameraIcon,
  "Wedding Venues": Building2Icon,
  "Decoration & Florist": Flower2Icon,
  "Catering Services": UtensilsCrossedIcon,
  "Makeup & Styling": SparklesIcon,
  "Wedding Fashion": ShirtIcon,
};

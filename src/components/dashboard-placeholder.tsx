import { CheckIcon } from "lucide-react";
import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DashboardPlaceholder({
  title,
  description,
  items = [],
  children,
}: {
  title: string;
  description: string;
  items?: string[];
  children?: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {children}
      </CardContent>
    </Card>
  );
}

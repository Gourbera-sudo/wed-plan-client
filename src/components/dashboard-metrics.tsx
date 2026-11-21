import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type DashboardMetric = {
  label: string;
  value: string;
  hint?: string;
};

export function DashboardMetrics({ items }: { items: DashboardMetric[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label} size="sm">
          <CardHeader>
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="font-heading text-2xl">{item.value}</CardTitle>
          </CardHeader>
          {item.hint ? (
            <CardContent className="text-xs text-muted-foreground">{item.hint}</CardContent>
          ) : null}
        </Card>
      ))}
    </div>
  );
}

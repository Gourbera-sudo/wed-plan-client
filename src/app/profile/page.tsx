import { ButtonLink } from "@/components/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Manage how your profile appears across WedPlan.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Profile editing is coming soon.
        </CardContent>
        <CardFooter className="justify-between gap-2">
          <ButtonLink variant="outline" href="/dashboard">
            Back to dashboard
          </ButtonLink>
        </CardFooter>
      </Card>
    </div>
  );
}

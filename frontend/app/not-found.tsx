import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-5 max-w-sm">
        <div className="mx-auto size-14 rounded-2xl bg-muted flex items-center justify-center">
          <span className="text-2xl font-bold text-muted-foreground/40">404</span>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-1">Page not found</h2>
          <p className="text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
        <Button asChild variant="default">
          <Link href="/">Back to inbox</Link>
        </Button>
      </div>
    </div>
  );
}

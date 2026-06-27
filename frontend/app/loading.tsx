import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <Skeleton className="mx-auto size-12 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="mx-auto h-4 w-48" />
          <Skeleton className="mx-auto h-3 w-32" />
        </div>
        <div className="flex justify-center gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              className="size-2 rounded-full"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

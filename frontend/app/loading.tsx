export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="size-10 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 size-10 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground font-mono">Loading...</p>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="h-28 rounded-2xl border border-foreground/10 bg-foreground/10 backdrop-blur animate-pulse" />
        <div className="h-28 rounded-2xl border border-foreground/10 bg-foreground/10 backdrop-blur animate-pulse" />
        <div className="h-28 rounded-2xl border border-foreground/10 bg-foreground/10 backdrop-blur animate-pulse" />
        <div className="h-28 rounded-2xl border border-foreground/10 bg-foreground/10 backdrop-blur animate-pulse" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="h-[520px] rounded-3xl border border-foreground/10 bg-foreground/10 backdrop-blur animate-pulse lg:col-span-2" />
        <div className="space-y-4">
          <div className="h-64 rounded-3xl border border-foreground/10 bg-foreground/10 backdrop-blur animate-pulse" />
          <div className="h-48 rounded-3xl border border-foreground/10 bg-foreground/10 backdrop-blur animate-pulse" />
        </div>
      </div>
    </div>
  );
}

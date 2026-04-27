function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-full bg-muted ${className}`} />;
}

export default function Loading() {
  return (
    <div className="space-y-7">
      <section className="space-y-6 rounded-[2.25rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur sm:p-6">
        <div className="space-y-2.5">
          <SkeletonBlock className="h-3 w-28" />
          <SkeletonBlock className="h-9 w-3/4 max-w-md" />
          <SkeletonBlock className="h-5 w-48" />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="h-10 animate-pulse rounded-full bg-primary/20" />
          <div className="h-10 animate-pulse rounded-full bg-secondary/70" />
          <div className="h-10 animate-pulse rounded-full bg-secondary/40" />
        </div>
      </section>

      <section className="space-y-4">
        {Array.from({ length: 4 }, (_, index) => (
          <article
            key={index}
            className="rounded-[1.75rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2.5 rounded-[1.25rem] bg-background/80 p-4">
                <SkeletonBlock className="h-3 w-16" />
                <div className="space-y-2">
                  <SkeletonBlock className="h-5 w-4/5" />
                  <SkeletonBlock className="h-5 w-3/5" />
                </div>
              </div>
              <div className="space-y-2.5 rounded-[1.25rem] bg-background/80 p-4">
                <SkeletonBlock className="h-3 w-16" />
                <div className="space-y-2">
                  <SkeletonBlock className="h-5 w-4/5" />
                  <SkeletonBlock className="h-5 w-2/3" />
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

type AuthCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  footer?: React.ReactNode;
};

export function AuthCard({ eyebrow, title, description, footer }: AuthCardProps) {
  return (
    <section className="space-y-6 rounded-[2rem] border border-border bg-card/85 p-6 shadow-sm backdrop-blur">
      <div className="space-y-3">
        <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-secondary-foreground">
          {eyebrow}
        </span>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-balance">{title}</h1>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="rounded-[1.5rem] border border-dashed border-border bg-background/80 p-4 text-sm text-muted-foreground">
        UI-only placeholder. Inputs and submission flows are intentionally omitted.
      </div>
      {footer}
    </section>
  );
}

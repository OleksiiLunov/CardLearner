type SectionIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionIntro({ eyebrow, title, description }: SectionIntroProps) {
  return (
    <section className="space-y-3">
      <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">
        {eyebrow}
      </span>
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight text-balance">{title}</h1>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </section>
  );
}

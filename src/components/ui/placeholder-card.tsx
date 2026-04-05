import Link from "next/link";
import { ChevronRight } from "lucide-react";

type PlaceholderCardProps = {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
};

export function PlaceholderCard({ title, description, href, actionLabel }: PlaceholderCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-[2rem] border border-border bg-card/80 p-5 shadow-sm backdrop-blur"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <span className="rounded-full bg-secondary p-2 text-secondary-foreground">
          <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>
      <p className="mt-5 text-sm font-medium text-foreground">{actionLabel}</p>
    </Link>
  );
}

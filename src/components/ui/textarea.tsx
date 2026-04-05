import * as React from "react";

import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-52 w-full rounded-[1.5rem] border border-border bg-background/90 px-4 py-3.5 text-sm leading-6 text-foreground shadow-sm outline-none placeholder:text-muted-foreground transition-colors focus:border-primary focus:bg-background",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };

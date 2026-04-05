import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex min-h-12 w-full rounded-[1.25rem] border border-border bg-background/90 px-4 py-3 text-sm text-foreground shadow-sm outline-none placeholder:text-muted-foreground transition-colors focus:border-primary focus:bg-background",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };

import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-12 w-full min-w-0 rounded-xl border-2 border-[#E0DCD7] bg-[#F8F5F2] px-4 py-2 text-base shadow-sm transition-[color,box-shadow,border-color] outline-none font-body",
        "focus-visible:border-[#E9B44C] focus-visible:ring-2 focus-visible:ring-[#E9B44C]/25",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props} />
  );
}

export { Input }

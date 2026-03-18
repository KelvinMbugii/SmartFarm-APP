import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({
  className,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-[#E0DCD7] placeholder:text-muted-foreground focus-visible:border-[#E9B44C] focus-visible:ring-2 focus-visible:ring-[#E9B44C]/25 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-xl border-2 bg-[#F8F5F2] px-4 py-3 text-base shadow-sm transition-[color,box-shadow] outline-none font-body resize-none",
        className
      )}
      {...props} />
  );
}

export { Textarea }

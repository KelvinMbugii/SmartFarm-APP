import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 font-heading uppercase tracking-wide transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-[#1B4332] text-white",
        secondary:
          "bg-[#E9B44C] text-[#1B4332]",
        destructive:
          "bg-destructive text-white",
        outline:
          "border-2 border-[#1B4332] text-[#1B4332] bg-transparent",
        success:
          "bg-[#7A9A3E] text-white",
        warning:
          "bg-[#E9B44C] text-[#1B4332]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }

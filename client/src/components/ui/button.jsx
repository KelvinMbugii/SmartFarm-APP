import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-heading font-semibold uppercase tracking-wide text-sm transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#E9B44C] focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-[#E9B44C] text-[#1B4332] shadow-md hover:brightness-110 hover:scale-[1.02] active:scale-95 rounded-full px-6 py-3",
        destructive:
          "bg-destructive text-white shadow-md hover:bg-destructive/90 rounded-full",
        outline:
          "border-2 border-[#E9B44C] bg-transparent text-[#E9B44C] hover:bg-[#E9B44C] hover:text-[#1B4332] rounded-full",
        secondary:
          "bg-[#1B4332] text-white shadow-md hover:brightness-110 hover:scale-[1.02] active:scale-95 rounded-full",
        ghost:
          "hover:bg-[#1B4332]/10 text-[#1B4332] rounded-lg",
        link: "text-[#1B4332] underline-offset-4 hover:underline rounded-none px-0",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-full gap-1.5 px-4 has-[>svg]:px-3 text-xs",
        lg: "h-14 px-8 has-[>svg]:px-4 text-base",
        icon: "size-12 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }

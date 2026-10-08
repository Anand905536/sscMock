import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const buttonVariants = ({
  variant = "default",
  size = "default",
}) => {
  const variants = {
    default:
      "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive:
      "bg-destructive text-white hover:bg-destructive/90",
    outline:
      "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost:
      "hover:bg-accent hover:text-accent-foreground",
    link:
      "text-primary underline-offset-4 hover:underline",
  };

  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md gap-1.5 px-3",
    lg: "h-10 rounded-md px-6",
    icon: "size-9",
  };

  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-ring",
    variants[variant],
    sizes[size]
  );
};

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size }),
        className
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
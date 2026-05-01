import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/85 active:bg-primary/95 shadow-sm hover:shadow-md hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/85 active:bg-destructive/95 shadow-sm hover:shadow-md hover:-translate-y-0.5",
        outline: "border border-input bg-background hover:bg-muted/50 hover:border-primary/30 active:bg-muted text-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/75 active:bg-secondary/90 shadow-sm hover:shadow-md hover:-translate-y-0.5",
        ghost: "hover:bg-muted/50 text-foreground active:bg-muted",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/85",
        success: "bg-success text-success-foreground hover:bg-success/85 active:bg-success/95 shadow-sm hover:shadow-md hover:-translate-y-0.5",
        hero: "bg-primary text-primary-foreground hover:bg-primary/85 active:bg-primary/95 shadow-md hover:shadow-lg text-base py-3 px-6 hover:-translate-y-1",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-lg font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

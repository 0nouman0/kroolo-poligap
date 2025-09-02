import type { VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export const buttonVariants = cva(
  "hover:bg-btn-hover inline-flex cursor-pointer items-center justify-center gap-[6px] rounded-[4px] border border-transparent font-medium whitespace-nowrap transition-none focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground border border-transparent hover:brightness-90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-transparent",
        outline:
          "text-btn-forground border-btn-border hover:bg-secondary/70 border bg-transparent",
        secondary:
          "bg-secondary text-secondary-foreground border border-transparent hover:brightness-90",
        ghost:
          "text-ghost-foreground hover:bg-secondary border border-transparent bg-transparent",
        link: "text-primary border border-transparent bg-transparent underline-offset-4 hover:underline",
      },
      size: {
        xs: "px-2 py-1 text-[11px]",
        sm: "px-3 py-1 text-[12px]",
        md: "px-4 py-1.5 text-[12px]", // ← updated this line
        lg: "px-5 py-2 text-[14px]",
        xl: "px-6 py-2.5 text-[16px]",
        icon: "size-9 p-2",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      prefixIcon,
      suffixIcon,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    // List of props that should only go on a <button>
    const buttonOnlyProps = [
      "type",
      "disabled",
      "onClick",
      "onDoubleClick",
      "onMouseDown",
      "onMouseUp",
      "onPointerDown",
      "onPointerUp",
      "onKeyDown",
      "onKeyUp",
      "tabIndex",
      "autoFocus",
      "form",
      "formAction",
      "formEncType",
      "formMethod",
      "formNoValidate",
      "formTarget",
      "name",
      "value",
    ];

    // If asChild, filter out button-only props
    const filteredProps = asChild
      ? Object.fromEntries(
          Object.entries(props).filter(
            ([key]) => !buttonOnlyProps.includes(key)
          )
        )
      : props;

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...filteredProps}
      >
        {asChild ? (
          <span style={{ display: "contents" }}>
            {prefixIcon}
            {children}
            {suffixIcon}
          </span>
        ) : (
          <>
            {prefixIcon}
            {children}
            {suffixIcon}
          </>
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

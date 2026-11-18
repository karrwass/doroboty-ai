import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// DoRoboty Design buttons (docs/design-system/doroboty-design): pill shape, indigo primary,
// white secondary with a control border, quiet ghost, link as tertiary. Classes live in
// src/design-system/praca.css so plain elements and this primitive share one definition.
const buttonVariants = cva(
  "group/button gap-2 select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "ds-btn ds-btn-primary",
        outline: "ds-btn ds-btn-secondary",
        secondary: "ds-btn ds-btn-secondary",
        ghost: "ds-btn ds-btn-ghost",
        destructive: "ds-btn ds-btn-secondary ds-btn-danger",
        link: "ds-link",
      },
      size: {
        default: "",
        xs: "ds-btn-sm",
        sm: "ds-btn-sm",
        lg: "ds-btn-lg",
        icon: "ds-btn-icon",
        "icon-xs": "ds-btn-icon ds-btn-icon-sm",
        "icon-sm": "ds-btn-icon ds-btn-icon-sm",
        "icon-lg": "ds-btn-icon",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

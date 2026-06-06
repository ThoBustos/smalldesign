import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full border px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-neutral-950 bg-neutral-950 text-white hover:bg-neutral-800",
        outline: "border-neutral-950 bg-transparent text-neutral-950 hover:bg-neutral-950 hover:text-white",
        quiet: "border-transparent bg-neutral-100 text-neutral-950 hover:bg-neutral-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

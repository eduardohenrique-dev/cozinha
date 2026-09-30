import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "@/lib/cx";

export type Variant = "primary" | "accent" | "ghost" | "outline" | "danger" | "soft";
export type Size = "sm" | "md" | "lg" | "icon" | "icon-sm";

const base =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[transform,background-color,color,box-shadow,border-color] duration-300 ease-organic active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-text shadow-soft hover:bg-primary-deep hover:text-surface",
  accent: "bg-accent text-text shadow-soft hover:bg-danger hover:text-surface",
  soft: "bg-primary-soft text-primary-deep hover:bg-primary hover:text-text",
  ghost: "text-text-muted hover:bg-text/5 hover:text-text",
  outline: "border border-line-strong bg-surface text-text hover:border-text/50",
  danger: "bg-danger-soft text-danger-strong hover:bg-danger-strong hover:text-surface",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-7 text-base",
  icon: "h-11 w-11",
  "icon-sm": "h-9 w-9",
};

export const buttonClass = (variant: Variant = "primary", size: Size = "md", className = "") =>
  cx(base, variants[variant], sizes[size], className);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, type = "button", ...rest },
  ref,
) {
  return <button ref={ref} type={type} className={buttonClass(variant, size, className)} {...rest} />;
});

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}

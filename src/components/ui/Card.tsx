import type { HTMLAttributes } from "react";
import { cx } from "@/lib/cx";

type Props = HTMLAttributes<HTMLDivElement> & { alt?: boolean; flat?: boolean };

export function Card({ alt, flat, className, ...rest }: Props) {
  return (
    <div
      className={cx(
        alt ? "rounded-card-alt" : "rounded-card",
        flat ? "border border-line bg-surface" : "bg-surface shadow-soft",
        className,
      )}
      {...rest}
    />
  );
}

import type { ReactNode } from "react";
import { Appear } from "@/components/gsap/Appear";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Appear>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="text-sm text-text-muted">{eyebrow}</p>}
          <h1 className="mt-1 font-display text-4xl font-light md:text-5xl">{title}</h1>
          {subtitle && <p className="mt-3 max-w-md text-text-muted">{subtitle}</p>}
        </div>
        {action && <div className="flex gap-2">{action}</div>}
      </header>
    </Appear>
  );
}

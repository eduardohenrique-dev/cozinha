import type { ReactNode } from "react";

export function EmptyState({
  art,
  title,
  text,
  action,
}: {
  art: ReactNode;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="w-44 max-w-full">{art}</div>
      <h2 className="mt-6 font-display text-2xl font-light">{title}</h2>
      {text && <p className="mt-2 max-w-sm text-sm text-text-muted">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";
import { cx } from "@/lib/cx";

const field =
  "w-full rounded-2xl border border-line-strong bg-surface px-4 text-base text-text placeholder:text-text-faint transition-[border-color,box-shadow] duration-300 ease-organic focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:opacity-60";

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-1.5 block text-sm font-medium text-text">{label}</span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs text-danger-strong">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { suffix?: string };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, suffix, ...rest },
  ref,
) {
  if (suffix) {
    return (
      <span className="relative block">
        <input ref={ref} className={cx(field, "h-12 pr-14", className)} {...rest} />
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-text-muted">
          {suffix}
        </span>
      </span>
    );
  }
  return <input ref={ref} className={cx(field, "h-12", className)} {...rest} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return <textarea ref={ref} className={cx(field, "min-h-32 resize-y py-3 leading-relaxed", className)} {...rest} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...rest }, ref) {
    return (
      <span className="relative block">
        <select ref={ref} className={cx(field, "h-12 appearance-none pr-10", className)} {...rest}>
          {children}
        </select>
        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-muted"
        />
      </span>
    );
  },
);

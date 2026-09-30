"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, BookOpen, ShoppingBasket, Plus, CalendarDays } from "lucide-react";

const items = [
  { href: "/", label: "Hoje", icon: Sun },
  { href: "/receitas", label: "Receitas", icon: BookOpen },
  { href: "/despensa", label: "Despensa", icon: ShoppingBasket },
  { href: "/registrar", label: "Registrar", icon: Plus },
  { href: "/historico", label: "Histórico", icon: CalendarDays },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line/60 bg-bg/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-shell items-center justify-between px-5 md:px-8">
          <Link href="/" className="font-display text-[1.65rem] italic leading-none tracking-tight">
            cozinha
            <span className="ml-1 inline-block h-2 w-2 rounded-full bg-primary align-middle" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {items.map(({ href, label }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative rounded-full px-4 py-2 text-sm transition-colors duration-300 ease-organic ${
                    active ? "text-text" : "text-text-muted hover:text-text"
                  }`}
                >
                  {label}
                  {active && (
                    <span className="absolute inset-x-4 -bottom-0.5 h-[3px] rounded-full bg-accent" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-30 md:hidden">
        <div className="mx-auto mb-[max(env(safe-area-inset-bottom),0.75rem)] w-[min(92%,26rem)] rounded-[28px] border border-line/70 bg-surface/95 px-2 py-2 shadow-lift backdrop-blur-sm">
          <ul className="grid grid-cols-5">
            {items.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] transition-colors duration-300 ease-organic ${
                      active ? "bg-primary-soft text-primary-deep" : "text-text-muted"
                    }`}
                  >
                    <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}

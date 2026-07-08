"use client";

import { CalendarDays, History, Home, LineChart, PlusCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const ITEMS = [
  { href: "/", label: "Today", icon: Home },
  { href: "/log", label: "Log", icon: PlusCircle },
  { href: "/history", label: "History", icon: History },
  { href: "/progress", label: "Progress", icon: LineChart },
  { href: "/weekly", label: "Weekly", icon: CalendarDays },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 border-t border-border bg-bg-soft/90 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={clsx(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-accent" : "text-text-faint",
                )}
              >
                <span
                  className={clsx(
                    "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                    active && "bg-accent-soft",
                  )}
                >
                  <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LibraryBig, SquarePen } from "lucide-react";

import { useTranslation } from "@/i18n/useTranslation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/lists",
    label: "Lists",
    icon: LibraryBig,
    match: (pathname: string) => pathname.startsWith("/lists"),
  },
  {
    href: "/study/setup",
    label: "Study",
    icon: BookOpen,
    match: (pathname: string) => pathname.startsWith("/study"),
  },
  {
    href: "/lists/new",
    label: "Create",
    icon: SquarePen,
    match: (pathname: string) => pathname === "/lists/new",
  },
];

export function MobileNav() {
  const { t } = useTranslation();
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-4 z-30 mx-auto w-[calc(100%-2rem)] max-w-md rounded-[2rem] border border-white/70 bg-card/95 p-2 shadow-lg backdrop-blur">
      <ul className="grid grid-cols-3 gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.match(pathname);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-[1.25rem] px-3 py-2 text-xs font-medium text-muted-foreground",
                  isActive && "bg-secondary text-secondary-foreground",
                )}
              >
                <Icon className="size-4" />
                <span>
                  {item.href === "/lists"
                    ? t("navigation.lists")
                    : item.href === "/study/setup"
                      ? t("navigation.study")
                      : t("navigation.create")}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

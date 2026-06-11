"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Careers", href: "/careers" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "History", href: "/history" },
  { label: "Leaderboards", href: "/leaderboards" },
  { label: "Badges", href: "/badges" },
  { label: "Profile", href: "/profile/player" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(href + "/");
}

export default function NavBar() {
  const pathname = usePathname() || "/";

  return (
    <header className="border-b border-white/10 bg-zinc-950/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8 lg:px-12">
        <Link href="/" className="text-lg font-semibold text-white">
          CareerSim
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-sky-500/15 text-sky-200 shadow-sm shadow-sky-500/20"
                    : "text-zinc-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

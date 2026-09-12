"use client";

import { Bike, ChefHat, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { OperationsProfile } from "@/lib/meathead-api";

interface OperationsShellProps {
  active: "admin" | "chef" | "rider";
  profile: OperationsProfile;
  title: string;
  subtitle: string;
  onSignOut: () => Promise<void>;
  children: ReactNode;
}

export default function OperationsShell({ active, profile, title, subtitle, onSignOut, children }: OperationsShellProps) {
  const navClass = (item: "admin" | "chef" | "rider") => `flex min-h-11 items-center gap-2 border-b-2 px-3 font-data text-xs font-bold uppercase tracking-[0.12em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meathead-red ${active === item ? "border-meathead-red text-white" : "border-transparent text-white/55 hover:text-white"}`;
  const navItems = profile.role === "ADMIN"
    ? [
        { key: "admin" as const, href: "/admin", label: "Admin", icon: LayoutDashboard },
        { key: "chef" as const, href: "/chef", label: "Chef", icon: ChefHat },
        { key: "rider" as const, href: "/rider", label: "Rider", icon: Bike },
      ]
    : profile.role === "RIDER"
      ? [{ key: "rider" as const, href: "/rider", label: "Rider", icon: Bike }]
      : [{ key: "chef" as const, href: "/chef", label: "Chef", icon: ChefHat }];

  return <div className="operations-app min-h-dvh bg-meathead-black text-white">
    <a href="#operations-main" className="sr-only z-50 bg-white px-4 py-3 font-semibold text-black focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Skip to operations content</a>
    <header className="operations-safe-header sticky top-0 z-40 border-b border-white/10 bg-meathead-black/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href={active === "admin" ? "/admin" : active === "chef" ? "/chef" : "/rider"} className="py-4 font-heading text-2xl uppercase leading-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-meathead-red">MEATHEAD <span className="text-meathead-red">{active}</span></Link>
        <nav aria-label="Operations navigation" className="flex items-center gap-1 self-stretch">
          {navItems.map((item) => {
            const Icon = item.icon;
            return <Link key={item.key} href={item.href} aria-label={item.label} className={navClass(item.key)} aria-current={active === item.key ? "page" : undefined}><Icon size={16} aria-hidden="true" /><span className="hidden sm:inline">{item.label}</span></Link>;
          })}
          <button type="button" aria-label="Log out" onClick={() => void onSignOut()} className="ml-1 flex min-h-11 items-center gap-2 px-3 font-data text-xs font-bold uppercase tracking-[0.12em] text-white/55 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meathead-red"><LogOut size={16} aria-hidden="true" /><span className="hidden sm:inline">Log out</span></button>
        </nav>
      </div>
    </header>
    <main id="operations-main" className="operations-safe-main mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
      <div className="mb-8 border-l-2 border-meathead-red pl-4">
        <p className="font-data text-xs font-bold uppercase tracking-[0.2em] text-meathead-red">{profile.displayName} · {profile.role.toLowerCase()} workspace</p>
        <h1 className="mt-2 font-heading text-4xl uppercase leading-none sm:text-5xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">{subtitle}</p>
      </div>
      {children}
    </main>
  </div>;
}

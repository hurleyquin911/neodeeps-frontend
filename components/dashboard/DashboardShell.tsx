"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { NavItem } from "@/lib/dashboard-nav";
import { getNavForPath } from "@/lib/dashboard-nav";
import { DashboardSignOutButton } from "@/components/DashboardSignOutButton";
import { getStoredUserRaw } from "@/lib/auth-storage";
import { NavIcon } from "./NavIcon";
import { NotificationBell } from "./NotificationBell";
import { ChatInboxBell } from "./ChatInboxBell";

function getActiveHref(pathname: string, items: NavItem[]): string | null {
  let best: string | null = null;
  let bestLen = -1;
  for (const { href } of items) {
    if (pathname === href || pathname.startsWith(`${href}/`)) {
      if (href.length > bestLen) {
        best = href;
        bestLen = href.length;
      }
    }
  }
  return best;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const nav = useMemo(() => getNavForPath(pathname), [pathname]);
  const activeHref = useMemo(() => getActiveHref(pathname, nav.items), [pathname, nav.items]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = getStoredUserRaw();
      if (raw) {
        const u = JSON.parse(raw) as { name?: string; username?: string; email?: string };
        setDisplayName(u.name ?? u.username ?? u.email ?? null);
      }
    } catch {
      setDisplayName(null);
    }
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const SidebarIntro = ({
    density,
    showLogo,
  }: {
    density: "comfortable" | "compact";
    showLogo: boolean;
  }) => (
    <div
      className={`relative shrink-0 border-b border-gray-100 bg-white px-5 ${density === "comfortable" ? "pb-5 pt-2" : "py-4"}`}
    >
      {showLogo ? (
        <>
          <Link
            href="/dashboard"
            className={`text-[11px] font-bold uppercase tracking-[0.18em] transition ${nav.accent.decorative}`}
          >
            {nav.sidebarTitle}
          </Link>
          <p
            className={`font-bold tracking-tight text-gray-900 ${density === "comfortable" ? "mt-2 text-xl" : "mt-2 text-xs font-semibold text-gray-600"}`}
          >
            {nav.sidebarSubtitle}
          </p>
          <span
            className={`inline-flex items-center rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${nav.accent.badge} ${density === "comfortable" ? "mt-4" : "mt-2"}`}
          >
            {nav.roleLabel}
          </span>
        </>
      ) : (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">{nav.sidebarSubtitle}</p>
          <span
            className={`mt-2 inline-flex w-fit items-center rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${nav.accent.badge}`}
          >
            {nav.roleLabel}
          </span>
        </>
      )}
    </div>
  );

  const SidebarBody = ({ drawer }: { drawer?: boolean }) => (
    <div className={`flex w-full flex-col bg-white ${drawer ? "min-h-0 flex-1" : "h-full min-h-0"}`}>
      {!drawer && <SidebarIntro density="compact" showLogo={false} />}
      {drawer && <SidebarIntro density="comfortable" showLogo />}
      <nav
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-2 pb-2 pt-2"
        aria-label="Menu dashboard"
      >
        <div className="flex flex-col gap-0.5">
          {nav.items.map((item) => {
            const isActive = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition ${
                  isActive
                    ? `${nav.accent.activeBg} ${nav.accent.activeText}`
                    : `${nav.accent.navMuted} ${nav.accent.navHover}`
                }`}
              >
                <NavIcon name={item.icon} className={isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="sticky bottom-0 z-10 shrink-0 border-t border-gray-100 bg-white px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <DashboardSignOutButton variant="sidebar" />
      </div>
    </div>
  );

  const sidebarRailClass =
    "relative hidden min-h-0 w-[17.5rem] shrink-0 flex-col overflow-hidden rounded-tr-3xl border-r border-gray-100 bg-white text-gray-800 shadow-[4px_0_24px_-16px_rgba(0,0,0,0.08)] lg:flex lg:h-full lg:min-h-0";

  const brandStripClass =
    "hidden w-[17.5rem] shrink-0 items-center rounded-tr-3xl border-r border-gray-100 bg-white px-5 shadow-[4px_0_24px_-16px_rgba(0,0,0,0.06)] lg:flex";

  const mainTint =
    nav.roleKey === "hub"
      ? "from-teal-100/30"
      : nav.roleKey === "user"
        ? "from-teal-100/25"
        : nav.roleKey === "admin"
          ? "from-amber-100/30"
          : "from-violet-100/30";

  const TopChrome = () => (
    <header className="sticky top-0 z-30 flex h-[3.65rem] w-full shrink-0 items-stretch border-b border-gray-100 bg-white/95 backdrop-blur-md shadow-[0_2px_16px_-12px_rgba(0,0,0,0.10)]">
      <div className={brandStripClass}>
        <Link href="/dashboard" className={`font-bold uppercase tracking-[0.18em] ${nav.accent.decorative}`}>
          {nav.sidebarTitle}
        </Link>
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-600 shadow-sm transition hover:bg-teal-50 hover:text-teal-700 lg:hidden"
          aria-label="Buka menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
            <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-bold text-gray-900">
            {displayName ? `Hai, ${displayName} 👋` : "Dashboard kamu"}
          </p>
          <p className="truncate text-xs font-medium text-gray-500">{nav.roleLabel}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {nav.roleKey === "user" && <ChatInboxBell />}
          <NotificationBell />
          <DashboardSignOutButton variant="compact" />
        </div>
      </div>
    </header>
  );

  return (
    <div className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-[var(--brand-bg)]">
      <TopChrome />

      <div className="flex min-h-0 flex-1 items-stretch">
        <aside className={sidebarRailClass}>
          <SidebarBody />
        </aside>

        {/* Mobile backdrop */}
        <div
          className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[3px] transition-opacity lg:hidden ${
            mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={!mobileOpen}
          onClick={() => setMobileOpen(false)}
        />

        {/* Mobile drawer */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex min-h-0 w-[min(20rem,90vw)] max-w-full flex-col overflow-hidden rounded-r-3xl border-r border-gray-100 bg-white shadow-[24px_0_60px_-32px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-out lg:hidden ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarBody drawer />
        </aside>

        {/* Main content */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden border-l border-gray-100 bg-[var(--brand-bg)]">
          <main className="relative min-h-0 flex-1">
            <div
              className={`pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b ${mainTint} to-transparent opacity-80`}
              aria-hidden
            />
            <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

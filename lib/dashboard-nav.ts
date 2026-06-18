export type IconName =
  | "layout"
  | "compass"
  | "users"
  | "calendar"
  | "settings"
  | "clipboard"
  | "flag"
  | "chart"
  | "shield"
  | "userCog"
  | "cpu"
  | "sparkles"
  | "plus"
  | "home"
  | "userCircle"
  | "zap";

export type NavItem = {
  href: string;
  label: string;
  icon: IconName;
};

export type DashboardNavConfig = {
  roleKey: "hub" | "user" | "admin" | "superadmin";
  roleLabel: string;
  sidebarTitle: string;
  sidebarSubtitle: string;
  accent: {
    badge: string;
    activeBg: string;
    activeText: string;
    glow: string;
    decorative: string;
    navMuted: string;
    navHover: string;
  };
  items: NavItem[];
};

/** Hub — kombinasi primary teal + secondary amber */
export const hubNav: DashboardNavConfig = {
  roleKey: "hub",
  roleLabel: "Pusat akun",
  sidebarTitle: "Neodeeps",
  sidebarSubtitle: "Pilih pusat Anda",
  accent: {
    badge: "bg-teal-100 text-teal-900 ring-teal-200/80 shadow-sm",
    activeBg: "bg-white shadow-[0_1px_10px_-4px_rgba(20,184,166,0.25)] ring-2 ring-teal-200/60",
    activeText: "text-teal-900 font-semibold",
    glow: "from-teal-200/40 via-transparent to-amber-50/30",
    decorative: "text-teal-600 hover:text-teal-700",
    navMuted: "text-gray-600",
    navHover: "hover:bg-teal-50/90 hover:text-teal-900",
  },
  items: [
    { href: "/dashboard/user", label: "Pengguna", icon: "sparkles" },
    { href: "/dashboard/admin", label: "Admin", icon: "shield" },
    { href: "/dashboard/superadmin", label: "Super Admin", icon: "cpu" },
  ],
};

/** User — primary teal */
export const userNav: DashboardNavConfig = {
  roleKey: "user",
  roleLabel: "Pengguna",
  sidebarTitle: "Neodeeps",
  sidebarSubtitle: "Minat & aktivitas",
  accent: {
    badge: "bg-teal-100 text-teal-900 ring-teal-200/80 shadow-sm",
    activeBg: "bg-teal-50 shadow-[inset_0_0_0_1.5px_rgba(20,184,166,0.40)]",
    activeText: "text-teal-800 font-semibold",
    glow: "from-teal-200/45 via-transparent to-teal-50/30",
    decorative: "text-teal-600 hover:text-teal-700",
    navMuted: "text-gray-600",
    navHover: "hover:bg-teal-50/80 hover:text-teal-900",
  },
  items: [
    { href: "/dashboard/user", label: "Beranda", icon: "home" },
    { href: "/dashboard/user/explore", label: "Jelajahi", icon: "compass" },
    { href: "/dashboard/user/communities", label: "Komunitas saya", icon: "users" },
    { href: "/dashboard/user/events", label: "Acara saya", icon: "calendar" },
    { href: "/dashboard/user/create", label: "Buat acara", icon: "plus" },
    { href: "/dashboard/user/create-community", label: "Buat komunitas", icon: "sparkles" },
    { href: "/dashboard/user/settings", label: "Pengaturan", icon: "settings" },
    { href: "/dashboard/user/me", label: "Saya", icon: "userCircle" },
  ],
};

/** Admin — secondary amber */
export const adminNav: DashboardNavConfig = {
  roleKey: "admin",
  roleLabel: "Admin",
  sidebarTitle: "Neodeeps",
  sidebarSubtitle: "Moderasi platform",
  accent: {
    badge: "bg-amber-100 text-amber-900 ring-amber-200/80 shadow-sm",
    activeBg: "bg-amber-50 shadow-[inset_0_0_0_1.5px_rgba(245,158,11,0.40)]",
    activeText: "text-amber-800 font-semibold",
    glow: "from-amber-200/45 via-transparent to-amber-50/30",
    decorative: "text-amber-700 hover:text-amber-800",
    navMuted: "text-gray-600",
    navHover: "hover:bg-amber-50/90 hover:text-amber-900",
  },
  items: [
    { href: "/dashboard/admin", label: "Ringkasan", icon: "layout" },
    { href: "/dashboard/admin/moderation", label: "Antrian moderasi", icon: "clipboard" },
    { href: "/dashboard/admin/users", label: "Pengguna", icon: "users" },
    { href: "/dashboard/admin/quota", label: "Kuota", icon: "zap" },
    { href: "/dashboard/admin/insights", label: "Insight", icon: "chart" },
  ],
};

/** Superadmin — violet (tetap distinkif) */
export const superadminNav: DashboardNavConfig = {
  roleKey: "superadmin",
  roleLabel: "Super Admin",
  sidebarTitle: "Neodeeps",
  sidebarSubtitle: "Kontrol penuh sistem",
  accent: {
    badge: "bg-violet-100 text-violet-900 ring-violet-200/80 shadow-sm",
    activeBg: "bg-violet-50 shadow-[inset_0_0_0_1.5px_rgba(139,92,246,0.35)]",
    activeText: "text-violet-800 font-semibold",
    glow: "from-violet-200/40 via-transparent to-fuchsia-50/30",
    decorative: "text-violet-600 hover:text-violet-800",
    navMuted: "text-gray-600",
    navHover: "hover:bg-violet-50/90 hover:text-violet-900",
  },
  items: [
    { href: "/dashboard/superadmin", label: "Ringkasan", icon: "layout" },
    { href: "/dashboard/superadmin/users", label: "Pengguna", icon: "userCog" },
    { href: "/dashboard/superadmin/moderation", label: "Moderasi", icon: "shield" },
    { href: "/dashboard/superadmin/reports", label: "Laporan", icon: "flag" },
    { href: "/dashboard/superadmin/system", label: "Sistem", icon: "cpu" },
  ],
};

export function getNavForPath(pathname: string): DashboardNavConfig {
  if (pathname.startsWith("/dashboard/superadmin")) return superadminNav;
  if (pathname.startsWith("/dashboard/admin")) return adminNav;
  if (pathname.startsWith("/dashboard/user")) return userNav;
  return hubNav;
}

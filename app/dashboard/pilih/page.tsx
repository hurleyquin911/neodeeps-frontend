"use client";

/**
 * `/dashboard/pilih` mengarahkan bertoken ke dashboard sesuai peran; tanpa sesi → ke `/dashboard`.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { dashboardPathForRole } from "@/lib/dashboard-path";
import { getStoredToken, getStoredUserRaw } from "@/lib/auth-storage";

export default function DashboardPilihRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getStoredToken();
    const raw = typeof window !== "undefined" ? getStoredUserRaw() : null;
    if (token && raw) {
      try {
        const u = JSON.parse(raw) as { role?: string };
        router.replace(dashboardPathForRole(u.role));
        return;
      } catch {
        /* abaikan */
      }
    }
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-[30vh] items-center justify-center text-sm text-gray-500">
      Mengalihkan…
    </div>
  );
}

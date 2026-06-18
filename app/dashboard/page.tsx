"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardRolePicker } from "@/components/dashboard/DashboardRolePicker";
import { dashboardPathForRole } from "@/lib/dashboard-path";
import { getStoredToken, getStoredUserRaw } from "@/lib/auth-storage";

export default function DashboardIndexPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    try {
      const token = getStoredToken();
      const raw = typeof window !== "undefined" ? getStoredUserRaw() : null;
      if (token && raw) {
        const u = JSON.parse(raw) as { role?: string };
        router.replace(dashboardPathForRole(u.role));
        return;
      }
    } catch {
      /* abaikan payload rusak */
    }
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm font-semibold text-gray-600">Membuka dashboard kamu…</p>
        <p className="max-w-xs text-xs text-gray-500">Mengikut peran akun Anda.</p>
      </div>
    );
  }

  return <DashboardRolePicker />;
}

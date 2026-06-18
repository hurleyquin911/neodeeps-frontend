"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredToken } from "@/lib/auth-storage";

/**
 * Halaman perantara: baca UUID dari JWT lalu redirect ke profil publik sendiri.
 */
export function MeRedirect() {
  const router = useRouter();

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const uuid = payload.uuid as string | undefined;
      if (uuid) {
        router.replace(`/dashboard/user/profile/${uuid}`);
      } else {
        router.replace("/dashboard/user");
      }
    } catch {
      router.replace("/dashboard/user");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
        <p className="text-sm text-gray-500 font-semibold">Memuat profil…</p>
      </div>
    </div>
  );
}

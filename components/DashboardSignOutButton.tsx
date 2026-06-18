"use client";

import { useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth-storage";

type Props = { variant?: "default" | "compact" | "sidebar" };

export function DashboardSignOutButton({ variant = "default" }: Props) {
  const router = useRouter();

  const variantClass =
    variant === "sidebar"
      ? "block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-gray-600 transition hover:bg-teal-50 hover:text-teal-800"
      : variant === "compact"
        ? "rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
        : "text-sm font-semibold text-gray-500 underline-offset-2 hover:text-teal-700 hover:underline";

  return (
    <button
      type="button"
      onClick={() => {
        clearSession();
        router.push("/login");
        router.refresh();
      }}
      className={variantClass}
    >
      Keluar
    </button>
  );
}

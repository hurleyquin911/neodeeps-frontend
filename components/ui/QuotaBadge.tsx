"use client";

import { useState, useEffect } from "react";
import { fetchMyQuota, type QuotaInfo } from "@/lib/api";
import QuotaUpgradeModal from "./QuotaUpgradeModal";

interface Props {
  token: string;
  type: "event" | "community";
}

export default function QuotaBadge({ token, type }: Props) {
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMyQuota(token)
      .then(r => setQuota(r.data))
      .catch(() => null);
  }, [token]);

  if (!quota) return null;

  const used  = type === "event" ? quota.used_events      : quota.used_communities;
  const total = type === "event" ? quota.event_quota      : quota.community_quota;
  const free  = type === "event" ? quota.free_events      : quota.free_communities;
  const label = type === "event" ? "acara aktif"          : "komunitas aktif";
  const isFull = free <= 0;

  return (
    <>
      <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm
        ${isFull
          ? "border-red-200 bg-red-50"
          : "border-teal-100 bg-teal-50"
        }`}>
        <div className="flex-1">
          <p className={`font-bold ${isFull ? "text-red-700" : "text-teal-700"}`}>
            {isFull
              ? `⚠️ Slot ${label} penuh (${used}/${total} sekaligus)`
              : `✅ Bisa buat ${label}: ${free} slot tersisa (${used}/${total} dipakai)`
            }
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {isFull
              ? type === "event"
                ? "Hapus acara yang ada atau tunggu hingga selesai untuk membuat acara baru. Bukan batas seumur hidup."
                : "Hapus komunitas yang ada untuk membuat komunitas baru. Bukan batas seumur hidup."
              : "Slot bebas lagi setelah acara/komunitas dihapus atau tidak aktif."
            }
          </p>
        </div>
        {isFull && (
          <button
            onClick={() => setShowModal(true)}
            className="shrink-0 rounded-xl bg-red-500 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-red-600 transition"
          >
            {total <= 1 ? "Tambah slot" : "Upgrade"}
          </button>
        )}
      </div>

      <QuotaUpgradeModal
        token={token}
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}

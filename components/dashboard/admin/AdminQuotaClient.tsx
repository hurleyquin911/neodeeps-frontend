"use client";

import { useEffect, useState, useCallback } from "react";
import { adminFetchPurchases, adminConfirmPurchase, type QuotaPurchase } from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";

type PurchaseWithBuyer = QuotaPurchase & {
  buyer?: { uuid: string; name: string; email: string };
};

export default function AdminQuotaClient() {
  const [purchases, setPurchases] = useState<PurchaseWithBuyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending_payment" | "confirmed" | "all">("pending_payment");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await adminFetchPurchases(token, { status: filter === "all" ? undefined : filter, page, limit: 20 });
      setPurchases(res.data);
      setTotal(res.meta.total);
    } catch (e: unknown) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "Gagal memuat data" });
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => { void load(); }, [load]);

  async function confirm(uuid: string) {
    const token = getStoredToken();
    if (!token) return;
    setConfirming(uuid);
    setMsg(null);
    try {
      const res = await adminConfirmPurchase(token, uuid);
      setMsg({ type: "ok", text: res.message });
      await load();
    } catch (e: unknown) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "Gagal konfirmasi" });
    } finally {
      setConfirming(null);
    }
  }

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending_payment: "bg-amber-100 text-amber-700",
      confirmed: "bg-teal-100 text-teal-700",
      cancelled: "bg-red-100 text-red-600",
    };
    const label: Record<string, string> = {
      pending_payment: "Menunggu",
      confirmed: "Dikonfirmasi",
      cancelled: "Dibatalkan",
    };
    return (
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${map[s] ?? "bg-gray-100 text-gray-600"}`}>
        {label[s] ?? s}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-gray-900">Manajemen Kuota</h1>
        <p className="text-sm text-gray-500 mt-1">
          Konfirmasi pembayaran paket kuota dari pengguna.
        </p>
      </div>

      {/* Info paket */}
      <div className="rounded-2xl bg-teal-50 border border-teal-100 p-4 flex flex-wrap gap-6 text-sm">
        <div>
          <p className="text-xs text-teal-600 font-semibold uppercase">Harga per paket</p>
          <p className="font-extrabold text-teal-800 text-lg">Rp 19.000 / bulan</p>
        </div>
        <div>
          <p className="text-xs text-teal-600 font-semibold uppercase">Isi paket</p>
          <p className="font-extrabold text-teal-800 text-lg">+3 event &amp; +3 komunitas</p>
        </div>
        <div>
          <p className="text-xs text-teal-600 font-semibold uppercase">Rekening tujuan</p>
          <p className="font-extrabold text-teal-800 font-mono">BCA 1234567890 a/n FindCommunity</p>
        </div>
      </div>

      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${msg.type === "ok" ? "bg-teal-50 border border-teal-200 text-teal-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
          {msg.text}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["pending_payment", "confirmed", "all"] as const).map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${filter === f ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {f === "pending_payment" ? "Menunggu Konfirmasi" : f === "confirmed" ? "Sudah Dikonfirmasi" : "Semua"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
        </div>
      ) : purchases.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-12 text-center text-gray-400">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm">Tidak ada pembelian dengan status ini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map(p => (
            <div key={p.uuid} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start gap-4">
                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900">{p.buyer?.name ?? "—"}</p>
                    <p className="text-sm text-gray-500">{p.buyer?.email ?? ""}</p>
                    {statusBadge(p.payment_status)}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="font-semibold text-teal-700">
                      Rp {p.amount_idr.toLocaleString("id")}
                    </span>
                    <span>+{p.events_quota_added} event • +{p.communities_quota_added} komunitas</span>
                    <span className="text-gray-400">
                      {new Date(p.created_at).toLocaleString("id")}
                    </span>
                    {p.valid_until && (
                      <span className="text-amber-600">
                        Berlaku s/d {new Date(p.valid_until).toLocaleDateString("id")}
                      </span>
                    )}
                  </div>
                  {p.payment_proof_url && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1 font-semibold">Bukti Transfer:</p>
                      <a href={p.payment_proof_url} target="_blank" rel="noreferrer">
                        <img
                          src={p.payment_proof_url}
                          alt="Bukti transfer"
                          className="h-24 rounded-xl object-cover border border-gray-200 hover:opacity-90 transition"
                        />
                      </a>
                    </div>
                  )}
                  {!p.payment_proof_url && p.payment_status === "pending_payment" && (
                    <p className="mt-2 text-xs text-amber-600 font-semibold">
                      ⏳ Menunggu upload bukti transfer dari pengguna
                    </p>
                  )}
                </div>

                {/* Action */}
                {p.payment_status === "pending_payment" && (
                  <button
                    onClick={() => confirm(p.uuid)}
                    disabled={confirming === p.uuid}
                    className="shrink-0 rounded-xl bg-teal-500 px-4 py-2 text-sm font-extrabold text-white hover:bg-teal-600 disabled:opacity-50 transition"
                  >
                    {confirming === p.uuid ? "Mengonfirmasi…" : "✓ Konfirmasi"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Total: {total} pembelian</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40">← Prev</button>
            <span className="px-2 py-1.5 font-semibold">Hal {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={purchases.length < 20}
              className="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50 disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}

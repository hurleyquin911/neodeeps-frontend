"use client";

import { useState, useEffect } from "react";
import {
  fetchMyQuota,
  requestQuotaPurchase,
  uploadImage,
  uploadPaymentProof,
  cancelQuotaPurchase,
  type QuotaInfo,
  type QuotaPurchase,
  type PaymentInfo,
} from "@/lib/api";

interface Props {
  token: string;
  open: boolean;
  onClose: () => void;
}

type Step = "info" | "confirm" | "payment" | "proof" | "done";

export default function QuotaUpgradeModal({ token, open, onClose }: Props) {
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [purchases, setPurchases] = useState<QuotaPurchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("info");
  const [packs, setPacks] = useState(1);
  const [purchase, setPurchase] = useState<QuotaPurchase | null>(null);
  const [payInfo, setPayInfo] = useState<PaymentInfo | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [err, setErr] = useState("");
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStep("info");
      setErr("");
      loadQuota();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function loadQuota() {
    setLoading(true);
    try {
      const result = await fetchMyQuota(token);
      setQuota(result.data);
      setPurchases(result.purchases);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal memuat kuota");
    } finally {
      setLoading(false);
    }
  }

  async function handleOrder() {
    setLoading(true);
    setErr("");
    try {
      const res = await requestQuotaPurchase(token, packs);
      setPurchase(res.data);
      setPayInfo(res.payment_info);
      setStep("payment");
      await loadQuota();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal membuat pesanan");
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadProof() {
    if (!proofFile || !purchase) return;
    setUploadingProof(true);
    setErr("");
    try {
      const proofUrl = await uploadImage(token, proofFile);
      await uploadPaymentProof(token, purchase.uuid, proofUrl);
      setStep("done");
      await loadQuota();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal upload bukti");
    } finally {
      setUploadingProof(false);
    }
  }

  async function handleCancel(uuid: string) {
    setCancelling(uuid);
    try {
      await cancelQuotaPurchase(token, uuid);
      await loadQuota();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Gagal membatalkan");
    } finally {
      setCancelling(null);
    }
  }

  if (!open) return null;

  const totalPrice = packs * (quota?.price_per_pack ?? 19000);
  const addedQuota = packs * (quota?.quota_per_pack ?? 3);
  const pendingPurchases = purchases.filter(p => p.payment_status === "pending_payment");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-amber-400 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold">⚡ Upgrade Kuota</h2>
              <p className="text-sm opacity-80">Buat lebih banyak event & komunitas</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 hover:bg-white/20 transition text-white text-lg"
            >✕</button>
          </div>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
            </div>
          )}

          {err && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {err}
            </div>
          )}

          {!loading && quota && step === "info" && (
            <>
              {/* Kuota saat ini */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-teal-50 border border-teal-100 p-4 text-center">
                  <p className="text-xs text-teal-600 font-semibold mb-1">Event</p>
                  <p className="text-2xl font-extrabold text-teal-700">
                    {quota.used_events}<span className="text-base text-teal-400">/{quota.event_quota}</span>
                  </p>
                  <p className="text-xs text-teal-500 mt-0.5">
                    {quota.free_events > 0 ? `${quota.free_events} slot tersisa` : "Penuh"}
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 text-center">
                  <p className="text-xs text-amber-600 font-semibold mb-1">Komunitas</p>
                  <p className="text-2xl font-extrabold text-amber-700">
                    {quota.used_communities}<span className="text-base text-amber-400">/{quota.community_quota}</span>
                  </p>
                  <p className="text-xs text-amber-500 mt-0.5">
                    {quota.free_communities > 0 ? `${quota.free_communities} slot tersisa` : "Penuh"}
                  </p>
                </div>
              </div>

              {/* Penjelasan paket */}
              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-2">
                <p className="text-sm font-extrabold text-gray-800">Paket Kuota</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">+ 3 slot event</span>
                  <span className="font-bold text-teal-600">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">+ 3 slot komunitas</span>
                  <span className="font-bold text-teal-600">✓</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-800">Harga per paket</span>
                  <span className="text-teal-700">Rp 19.000 / bulan</span>
                </div>
              </div>

              {/* Pilih jumlah paket */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Jumlah paket
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => setPacks(p => Math.max(1, p - 1))}
                    className="h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200 text-lg font-bold transition"
                  >−</button>
                  <span className="text-2xl font-extrabold text-gray-900 w-8 text-center">{packs}</span>
                  <button
                    onClick={() => setPacks(p => Math.min(10, p + 1))}
                    className="h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200 text-lg font-bold transition"
                  >+</button>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-xl font-extrabold text-teal-700">
                      Rp {totalPrice.toLocaleString("id")}
                    </p>
                    <p className="text-xs text-gray-400">+{addedQuota} event & komunitas</p>
                  </div>
                </div>
              </div>

              {/* Pending purchases */}
              {pendingPurchases.length > 0 && (
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-2">
                  <p className="text-xs font-bold text-amber-700 uppercase">Pembayaran menunggu konfirmasi</p>
                  {pendingPurchases.map(p => (
                    <div key={p.uuid} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-semibold text-amber-800">
                          Rp {p.amount_idr.toLocaleString("id")}
                        </p>
                        <p className="text-xs text-amber-600">
                          {new Date(p.created_at).toLocaleDateString("id")}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCancel(p.uuid)}
                        disabled={cancelling === p.uuid}
                        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        {cancelling === p.uuid ? "..." : "Batalkan"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setStep("confirm")}
                className="w-full rounded-2xl bg-teal-500 py-3 text-sm font-extrabold text-white hover:bg-teal-600 transition shadow-sm"
              >
                Beli Paket — Rp {totalPrice.toLocaleString("id")}
              </button>
            </>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-teal-50 border border-teal-100 p-4 space-y-2 text-sm">
                <p className="font-bold text-gray-800">Konfirmasi Pesanan</p>
                <div className="flex justify-between"><span className="text-gray-500">Paket</span><span>{packs}x Paket Kuota</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Tambah kuota</span><span>+{addedQuota} event & komunitas</span></div>
                <div className="flex justify-between font-bold border-t border-teal-100 pt-2">
                  <span>Total</span>
                  <span className="text-teal-700">Rp {totalPrice.toLocaleString("id")}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Setelah konfirmasi, kamu akan mendapat instruksi transfer. Kuota aktif setelah admin memverifikasi pembayaran.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setStep("info")} className="flex-1 rounded-2xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                  Kembali
                </button>
                <button onClick={handleOrder} disabled={loading} className="flex-1 rounded-2xl bg-teal-500 py-2.5 text-sm font-extrabold text-white hover:bg-teal-600 disabled:opacity-50 transition">
                  {loading ? "Memproses..." : "Ya, Pesan Sekarang"}
                </button>
              </div>
            </div>
          )}

          {step === "payment" && payInfo && purchase && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-2xl">🏦</div>
                <p className="font-extrabold text-gray-900">Instruksi Pembayaran</p>
                <p className="text-sm text-gray-500 mt-1">Transfer ke rekening berikut</p>
              </div>
              <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Bank</span>
                  <span className="font-bold">{payInfo.bank}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">No. Rekening</span>
                  <span className="font-bold font-mono">{payInfo.account_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Atas Nama</span>
                  <span className="font-bold">{payInfo.account_name}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="text-gray-500">Jumlah</span>
                  <span className="text-xl font-extrabold text-teal-700">
                    Rp {payInfo.amount_idr.toLocaleString("id")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Referensi</span>
                  <span className="font-mono text-xs bg-gray-200 rounded px-2 py-0.5">{payInfo.note}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Sertakan kode referensi pada berita transfer. Kemudian upload bukti transfer di bawah.
              </p>
              <button
                onClick={() => setStep("proof")}
                className="w-full rounded-2xl bg-amber-500 py-3 text-sm font-extrabold text-white hover:bg-amber-600 transition"
              >
                Sudah Transfer → Upload Bukti
              </button>
              <button onClick={onClose} className="w-full text-sm text-gray-400 hover:text-gray-600 transition">
                Nanti saja
              </button>
            </div>
          )}

          {step === "proof" && purchase && (
            <div className="space-y-4">
              <p className="text-sm font-bold text-gray-800 text-center">Upload Bukti Transfer</p>
              <label className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 cursor-pointer transition
                ${proofFile ? "border-teal-400 bg-teal-50" : "border-gray-200 bg-gray-50 hover:border-teal-300"}`}>
                <span className="text-3xl">{proofFile ? "✅" : "📷"}</span>
                <span className="text-sm text-gray-600 text-center">
                  {proofFile ? proofFile.name : "Klik untuk pilih foto struk/screenshot transfer"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => setProofFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <button
                onClick={handleUploadProof}
                disabled={!proofFile || uploadingProof}
                className="w-full rounded-2xl bg-teal-500 py-3 text-sm font-extrabold text-white hover:bg-teal-600 disabled:opacity-50 transition"
              >
                {uploadingProof ? "Mengunggah..." : "Kirim Bukti Transfer"}
              </button>
            </div>
          )}

          {step === "done" && (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-3xl">🎉</div>
              <p className="font-extrabold text-gray-900 text-lg">Bukti Terkirim!</p>
              <p className="text-sm text-gray-500">
                Tim kami akan memverifikasi pembayaranmu dalam waktu 1×24 jam. Kuota akan otomatis ditambahkan setelah dikonfirmasi.
              </p>
              <button
                onClick={onClose}
                className="w-full rounded-2xl bg-teal-500 py-3 text-sm font-extrabold text-white hover:bg-teal-600 transition"
              >
                Oke, Mengerti!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

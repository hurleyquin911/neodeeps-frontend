"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  fetchEventDetail, updateEvent, deleteEvent, submitEventForReview, uploadImage,
  type EventDetail,
} from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";

const fieldClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-teal-400 focus:bg-white focus:outline-none transition";
const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

export function EditEventClient({ eventUuid }: { eventUuid: string }) {
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  /* Form state */
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [timezone, setTimezone] = useState("Asia/Jakarta");
  const [format, setFormat] = useState<"physical" | "online" | "hybrid">("physical");
  const [venueName, setVenueName] = useState("");
  const [venueCity, setVenueCity] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [priceAmount, setPriceAmount] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [joinPolicy, setJoinPolicy] = useState<"open" | "restricted">("open");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const applyEvent = useCallback((e: EventDetail) => {
    setTitle(e.title ?? "");
    setSubtitle(e.subtitle ?? "");
    setDescription(e.description ?? "");
    setCoverUrl(e.cover_image_url ?? "");
    setStartsAt(e.starts_at ? e.starts_at.slice(0, 16) : "");
    setEndsAt(e.ends_at ? e.ends_at.slice(0, 16) : "");
    setTimezone(e.timezone ?? "Asia/Jakarta");
    setFormat((e.format as "physical" | "online" | "hybrid") ?? "physical");
    setVenueName(e.venue_name ?? "");
    setVenueCity(e.venue_city ?? "");
    setVenueAddress(e.venue_address_line ?? "");
    setMaxAttendees(e.max_attendees ? String(e.max_attendees) : "");
    setIsFree(e.is_free ?? true);
    setPriceAmount(e.price_amount ?? "");
    setTags(Array.isArray(e.tags) ? e.tags.join(", ") : "");
    setCategory(e.primary_category ?? "");
    setJoinPolicy((e.join_policy as "open" | "restricted") ?? "open");
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = getStoredToken();
        const data = await fetchEventDetail(eventUuid, token);
        setEvent(data);
        applyEvent(data);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Gagal memuat acara.");
      } finally {
        setLoading(false);
      }
    })();
  }, [eventUuid, applyEvent]);

  async function handleSave() {
    const token = getStoredToken();
    if (!token) return;
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const tagArr = tags.split(",").map((t) => t.trim()).filter(Boolean);
      await updateEvent(token, eventUuid, {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        description: description.trim() || null,
        cover_image_url: coverUrl.trim() || null,
        starts_at: startsAt || undefined,
        ends_at: endsAt || null,
        timezone,
        format,
        venue_name: venueName.trim() || null,
        venue_city: venueCity.trim() || null,
        venue_address_line: venueAddress.trim() || null,
        max_attendees: maxAttendees ? Number(maxAttendees) : null,
        is_free: isFree,
        price_amount: !isFree && priceAmount ? priceAmount : null,
        tags: tagArr.length ? tagArr : null,
        primary_category: category.trim() || null,
        join_policy: joinPolicy,
      });
      setMsg("✅ Perubahan disimpan!");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const token = getStoredToken();
    if (!token) return;
    setDeleting(true);
    try {
      await deleteEvent(token, eventUuid);
      router.replace("/dashboard/user/events");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Gagal menghapus.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function handleSubmit() {
    const token = getStoredToken();
    if (!token) return;
    setSubmitting(true);
    setMsg(null);
    setErr(null);
    try {
      await submitEventForReview(token, eventUuid);
      setMsg("✅ Berhasil dikirim ke moderasi!");
      const refreshed = await fetchEventDetail(eventUuid, token);
      setEvent(refreshed);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Gagal submit.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
    </div>
  );
  if (err && !event) return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <p className="text-5xl">❌</p>
      <p className="font-semibold text-gray-600">{err}</p>
      <button onClick={() => router.back()} className="rounded-xl bg-teal-500 px-6 py-2 text-sm font-bold text-white">Kembali</button>
    </div>
  );

  const isDraft = event?.status === "draft";
  const isPending = event?.status === "pending_review";

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-sm font-semibold text-gray-400 hover:text-teal-600">←</button>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Edit Acara</h1>
          <p className="text-xs text-gray-400">Status: <span className={`font-bold ${isDraft ? "text-amber-500" : isPending ? "text-blue-500" : "text-green-500"}`}>{event?.status}</span></p>
        </div>
      </div>

      {msg && <div className="rounded-xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-600">{msg}</div>}
      {err && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-500">{err}</div>}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
        <h2 className="font-extrabold text-gray-700 text-sm uppercase tracking-widest">Informasi Dasar</h2>

        {/* Cover image */}
        <div>
          <label className={labelClass}>Cover Acara</label>
          {coverUrl && <img src={coverUrl} alt="cover" className="mb-2 w-full rounded-xl object-cover" style={{ maxHeight: 180 }} />}
          <label className={`cursor-pointer inline-flex items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 ${uploadingCover ? "opacity-50 pointer-events-none" : ""}`}>
            {uploadingCover ? "⏳ Mengunggah…" : "📷 Pilih Foto Cover"}
            <input type="file" accept="image/*" className="hidden" disabled={uploadingCover}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                const t = getStoredToken();
                if (!file || !t) return;
                setUploadingCover(true);
                try { const url = await uploadImage(t, file); setCoverUrl(url); }
                catch (ex) { setErr(ex instanceof Error ? ex.message : "Upload gagal"); }
                finally { setUploadingCover(false); e.target.value = ""; }
              }} />
          </label>
        </div>

        <div>
          <label className={labelClass}>Judul Acara *</label>
          <input className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nama acara" />
        </div>
        <div>
          <label className={labelClass}>Tagline / Subtitle</label>
          <input className={fieldClass} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Kalimat singkat menarik" />
        </div>
        <div>
          <label className={labelClass}>Deskripsi</label>
          <textarea className={`${fieldClass} min-h-[120px] resize-y`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ceritakan acara ini…" />
        </div>
        <div>
          <label className={labelClass}>Kategori</label>
          <input className={fieldClass} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Teknologi, Seni, Olahraga…" />
        </div>
        <div>
          <label className={labelClass}>Tags (pisahkan koma)</label>
          <input className={fieldClass} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="startup, coding, jakarta" />
        </div>
      </div>

      {/* Waktu */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-extrabold text-gray-700 text-sm uppercase tracking-widest">Waktu</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Mulai *</label>
            <input type="datetime-local" className={fieldClass} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Selesai</label>
            <input type="datetime-local" className={fieldClass} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Zona Waktu</label>
          <select className={fieldClass} value={timezone} onChange={(e) => setTimezone(e.target.value)}>
            <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
            <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
            <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
          </select>
        </div>
      </div>

      {/* Lokasi */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-extrabold text-gray-700 text-sm uppercase tracking-widest">Lokasi & Format</h2>
        <div>
          <label className={labelClass}>Format</label>
          <select className={fieldClass} value={format} onChange={(e) => setFormat(e.target.value as "physical" | "online" | "hybrid")}>
            <option value="physical">🏟️ Fisik</option>
            <option value="online">💻 Online</option>
            <option value="hybrid">🔀 Hybrid</option>
          </select>
        </div>
        {format !== "online" && (
          <>
            <div>
              <label className={labelClass}>Nama Tempat</label>
              <input className={fieldClass} value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="Gedung, aula, café…" />
            </div>
            <div>
              <label className={labelClass}>Alamat</label>
              <input className={fieldClass} value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} placeholder="Jl. Sudirman No. 1" />
            </div>
            <div>
              <label className={labelClass}>Kota</label>
              <input className={fieldClass} value={venueCity} onChange={(e) => setVenueCity(e.target.value)} placeholder="Jakarta" />
            </div>
          </>
        )}
      </div>

      {/* Kapasitas & Harga */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-extrabold text-gray-700 text-sm uppercase tracking-widest">Kapasitas & Tiket</h2>
        <div>
          <label className={labelClass}>Maks. Peserta (kosongkan = tidak terbatas)</label>
          <input type="number" className={fieldClass} value={maxAttendees} onChange={(e) => setMaxAttendees(e.target.value)} placeholder="100" min="1" />
        </div>
        <div>
          <label className={labelClass}>Kebijakan Bergabung</label>
          <select className={fieldClass} value={joinPolicy} onChange={(e) => setJoinPolicy(e.target.value as "open" | "restricted")}>
            <option value="open">Terbuka (siapa pun bisa langsung bergabung)</option>
            <option value="restricted">Memerlukan persetujuan</option>
          </select>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} className="h-4 w-4 rounded accent-teal-500" />
          <span className="text-sm font-semibold text-gray-700">Acara gratis</span>
        </label>
        {!isFree && (
          <div>
            <label className={labelClass}>Harga (IDR)</label>
            <input type="text" className={fieldClass} value={priceAmount} onChange={(e) => setPriceAmount(e.target.value)} placeholder="50000" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={handleSave} disabled={saving}
          className="flex-1 rounded-xl bg-teal-500 py-3 text-sm font-extrabold text-white hover:bg-teal-600 disabled:opacity-50 transition shadow">
          {saving ? "Menyimpan…" : "💾 Simpan Perubahan"}
        </button>
        {isDraft && (
          <button onClick={handleSubmit} disabled={submitting}
            className="flex-1 rounded-xl bg-amber-400 py-3 text-sm font-extrabold text-white hover:bg-amber-500 disabled:opacity-50 transition shadow">
            {submitting ? "Mengirim…" : "📤 Kirim ke Moderasi"}
          </button>
        )}
      </div>

      {/* Hapus */}
      <div className="rounded-2xl border border-red-100 bg-red-50 p-4 space-y-3">
        <h3 className="text-sm font-extrabold text-red-600">⚠️ Zona Berbahaya</h3>
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)}
            className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-100 transition">
            🗑️ Hapus Acara
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-red-600 font-semibold">Yakin hapus acara ini? Tindakan tidak bisa dibatalkan.</p>
            <div className="flex gap-2">
              <button onClick={handleDelete} disabled={deleting}
                className="rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-50">
                {deleting ? "Menghapus…" : "Ya, Hapus"}
              </button>
              <button onClick={() => setConfirmDelete(false)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-500">
                Batal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

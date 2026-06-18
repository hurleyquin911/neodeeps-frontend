"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  createEvent,
  submitEventForReview,
  fetchMyCreatedCommunities,
  type CreateEventPayload,
  type GatheringType,
  type CommunityItem,
} from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";
import { EventImageUploader } from "@/components/ui/EventImageUploader";
import { LocationPicker, type LocationValue } from "@/components/ui/LocationPicker";
import QuotaBadge from "@/components/ui/QuotaBadge";

/* ── style constants ── */
const field =
  "mt-1.5 w-full rounded-2xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[15px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-200/40 disabled:opacity-55";
const label = "block text-sm font-semibold text-gray-700";
const sectionTitle = "text-xs font-bold uppercase tracking-[0.2em] text-teal-700";
const card = "rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-5";

/* ── helpers ── */
function todayIsoLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function parseTagsInput(raw: string): string[] {
  return raw
    .split(/[,\s]+/)
    .map((t) => t.trim().toLowerCase().replace(/^#/, ""))
    .filter(Boolean);
}

type Step = "info" | "waktu" | "tempat" | "kapasitas" | "review";
const STEPS: { key: Step; label: string; emoji: string }[] = [
  { key: "info", label: "Info dasar", emoji: "📝" },
  { key: "waktu", label: "Waktu", emoji: "🕐" },
  { key: "tempat", label: "Tempat", emoji: "📍" },
  { key: "kapasitas", label: "Kapasitas & akses", emoji: "🎟️" },
  { key: "review", label: "Tinjau & kirim", emoji: "🚀" },
];

export function CreateEventClient() {
  const [step, setStep] = useState<Step>("info");

  /* ── komunitas milik user (untuk selector) ── */
  const [myCommunities, setMyCommunities] = useState<CommunityItem[]>([]);
  const [hostingCommunityUuid, setHostingCommunityUuid] = useState<string>("");

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;
    fetchMyCreatedCommunities(token, { status: "published" })
      .then((r) => setMyCommunities(r.data))
      .catch(() => {});
  }, []);

  /* ── form state ── */
  const [gatheringType, setGatheringType] = useState<GatheringType>("scheduled_event");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [eventKind, setEventKind] = useState("");

  const [startsAt, setStartsAt] = useState(todayIsoLocal());
  const [endsAt, setEndsAt] = useState("");
  const [timezone, setTimezone] = useState("Asia/Jakarta");
  const [isAllDay, setIsAllDay] = useState(false);

  const [format, setFormat] = useState<"physical" | "online" | "hybrid">("physical");
  const [venueName, setVenueName] = useState("");
  const [onlineUrl, setOnlineUrl] = useState("");
  const [location, setLocation] = useState<LocationValue>({
    address_line: "", city: "", province: "", postal_code: "",
    country_code: "ID", latitude: null, longitude: null,
  });

  const [visibility, setVisibility] = useState<"public" | "unlisted" | "private">("public");
  const [joinPolicy, setJoinPolicy] = useState<"open" | "restricted">("open");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [waitlist, setWaitlist] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [allowGuest, setAllowGuest] = useState(false);
  const [maxGuestPerAttendee, setMaxGuestPerAttendee] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("IDR");
  const [ticketUrl, setTicketUrl] = useState("");
  const [houseRules, setHouseRules] = useState("");
  const [whatToBring, setWhatToBring] = useState("");

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftUuid, setDraftUuid] = useState<string | null>(null);
  const [success, setSuccess] = useState<"draft" | "submitted" | null>(null);

  /* ── validation per step ── */
  function validateStep(s: Step): string | null {
    if (s === "info") {
      if (!title.trim()) return "Judul wajib diisi.";
      if (title.trim().length < 3) return "Judul minimal 3 karakter.";
    }
    if (s === "waktu") {
      if (!startsAt) return "Waktu mulai wajib diisi.";
      if (endsAt && new Date(endsAt) <= new Date(startsAt)) return "Waktu selesai harus setelah waktu mulai.";
    }
    if (s === "tempat") {
      if (format === "online" && !onlineUrl.trim()) return "URL meeting wajib untuk format online.";
      if (format === "physical" && !location.city.trim()) return "Kota wajib untuk acara fisik.";
    }
    return null;
  }

  function goNext() {
    const keys = STEPS.map((s) => s.key);
    const idx = keys.indexOf(step);
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError(null);
    setStep(keys[idx + 1] as Step);
  }

  function goPrev() {
    const keys = STEPS.map((s) => s.key);
    const idx = keys.indexOf(step);
    setError(null);
    setStep(keys[idx - 1] as Step);
  }

  function buildPayload(): CreateEventPayload {
    return {
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      summary: summary.trim() || undefined,
      description: description.trim() || undefined,
      cover_image_url: coverUrl.trim() || undefined,
      gallery_urls: galleryUrls.length > 0 ? galleryUrls : undefined,
      gathering_type: gatheringType,
      event_kind: eventKind.trim() || undefined,
      format,
      visibility,
      join_policy: joinPolicy,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      timezone,
      is_all_day: isAllDay,
      venue_name: venueName.trim() || undefined,
      venue_address_line: location.address_line.trim() || undefined,
      venue_address_line_2: location.address_line_2?.trim() || undefined,
      venue_city: location.city.trim() || undefined,
      venue_region: location.province.trim() || undefined,
      venue_postal_code: location.postal_code.trim() || undefined,
      venue_country_code: location.country_code || undefined,
      latitude: location.latitude ?? undefined,
      longitude: location.longitude ?? undefined,
      online_meeting_url: onlineUrl.trim() || undefined,
      max_attendees: maxAttendees ? Number(maxAttendees) : null,
      waitlist_enabled: waitlist,
      requires_host_approval: requiresApproval,
      allow_guest_count: allowGuest,
      max_guests_per_attendee: allowGuest && maxGuestPerAttendee ? Number(maxGuestPerAttendee) : null,
      is_free: isFree,
      price_amount: !isFree && price ? Number(price) : null,
      price_currency: !isFree ? currency : undefined,
      external_ticketing_url: ticketUrl.trim() || undefined,
      primary_category: category.trim() || undefined,
      tags: tags.trim() ? parseTagsInput(tags) : undefined,
      house_rules: houseRules.trim() || undefined,
      what_to_bring: whatToBring.trim() || undefined,
      hosting_community_uuid: hostingCommunityUuid || undefined,
    };
  }

  async function saveDraft() {
    const token = getStoredToken();
    if (!token) { setError("Sesi habis. Silakan masuk kembali."); return; }
    setSaving(true);
    setError(null);
    try {
      const ev = await createEvent(token, buildPayload());
      setDraftUuid(ev.uuid);
      setSuccess("draft");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function saveAndSubmit() {
    const token = getStoredToken();
    if (!token) { setError("Sesi habis."); return; }
    setSubmitting(true);
    setError(null);
    try {
      let uuid = draftUuid;
      if (!uuid) {
        const ev = await createEvent(token, buildPayload());
        uuid = ev.uuid;
        setDraftUuid(uuid);
      }
      await submitEventForReview(token, uuid);
      setSuccess("submitted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengirim.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ── success screen ── */
  if (success) {
    return (
      <div className="flex flex-col items-center gap-6 py-20 text-center">
        <span className="text-6xl">{success === "submitted" ? "🎉" : "✅"}</span>
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">
            {success === "submitted" ? "Acara dipublikasikan! 🎉" : "Draft tersimpan!"}
          </h2>
          <p className="mt-2 max-w-sm text-base text-gray-600">
            {success === "submitted"
              ? "Acaramu sudah aktif dan bisa ditemukan di halaman Jelajahi sekarang."
              : "Acaramu tersimpan sebagai draft. Kamu bisa publikasikan kapan saja."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/user/events" className="rounded-full bg-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow hover:brightness-105">
            Lihat Acara Saya
          </Link>
          <button type="button" onClick={() => {
            setSuccess(null); setDraftUuid(null); setTitle(""); setSummary("");
            setDescription(""); setStep("info"); setError(null);
          }}
            className="rounded-full border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Buat lagi
          </button>
        </div>
      </div>
    );
  }

  const currentIdx = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Pengguna</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">Buat acara ✨</h1>
          <p className="mt-1 text-sm text-gray-500">Acara bisa berdiri sendiri atau diselenggarakan oleh komunitasmu.</p>
        </div>
        <Link href="/dashboard/user/events" className="shrink-0 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
          ← Kembali
        </Link>
      </header>

      {/* Callout perbedaan acara vs komunitas */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <span className="mt-0.5 shrink-0 text-xl">💡</span>
        <p className="text-sm text-amber-900">
          <strong>Acara vs Komunitas:</strong> Acara adalah kegiatan terjadwal — orang bisa mendaftar tanpa harus bergabung ke komunitasmu.
          Jika ingin membangun grup persisten, <Link href="/dashboard/user/create-community" className="font-bold underline">buat komunitas terlebih dahulu</Link>.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <button
              type="button"
              onClick={() => { if (i < currentIdx) { setError(null); setStep(s.key); } }}
              className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold transition ${
                s.key === step
                  ? "bg-teal-500 text-white shadow"
                  : i < currentIdx
                    ? "bg-teal-50 text-teal-700 hover:bg-teal-100"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              <span>{s.emoji}</span>
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{i + 1}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-4 shrink-0 sm:w-6 ${i < currentIdx ? "bg-teal-300" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* ── Step: Info dasar ── */}
      {step === "info" && (
        <div className={card}>
          <p className={sectionTitle}>📝 Informasi dasar</p>

          <div>
            <label className={label}>Tipe *</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {([
                { v: "scheduled_event", label: "Acara terjadwal", emoji: "📅" },
                { v: "meetup_gathering", label: "Perkumpulan", emoji: "👥" },
                { v: "community_session", label: "Sesi komunitas", emoji: "🏘️" },
                { v: "other", label: "Lainnya", emoji: "✨" },
              ] as const).map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setGatheringType(opt.v)}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-xs font-bold transition ${gatheringType === opt.v ? "border-teal-500 bg-teal-50 text-teal-800" : "border-gray-200 bg-white text-gray-600 hover:border-teal-200"}`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={label}>Judul *</label>
            <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="mis. Workshop Fotografi Jalanan Bandung" maxLength={255} />
            <p className="mt-1 text-right text-xs text-gray-400">{title.length}/255</p>
          </div>
          <div>
            <label className={label}>Subjudul (opsional)</label>
            <input className={field} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Tagline singkat" maxLength={500} />
          </div>
          <div>
            <label className={label}>Ringkasan singkat (untuk kartu listing) *</label>
            <textarea className={`${field} min-h-[5rem] resize-y`} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="1–2 kalimat yang menarik perhatian" maxLength={500} />
          </div>
          <div>
            <label className={label}>Deskripsi lengkap (opsional)</label>
            <textarea className={`${field} min-h-[8rem] resize-y`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detail acara, agenda, narasumber, dll." />
          </div>
          <EventImageUploader
            coverUrl={coverUrl}
            galleryUrls={galleryUrls}
            onCoverChange={setCoverUrl}
            onGalleryChange={setGalleryUrls}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Kategori utama</label>
              <select className={field} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Pilih…</option>
                {["meetup", "workshop", "conference", "social", "sports", "arts", "education", "tech", "business", "music", "food", "travel", "other"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Sub-jenis (event_kind)</label>
              <input className={field} value={eventKind} onChange={(e) => setEventKind(e.target.value)} placeholder="mis. lari pagi, book club" />
            </div>
          </div>
          <div>
            <label className={label}>Tag (pisahkan dengan koma atau spasi)</label>
            <input className={field} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="startup bandung kolaborasi" />
            {tags && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {parseTagsInput(tags).map((t) => (
                  <span key={t} className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Selector komunitas */}
          <div>
            <label className={label}>Diselenggarakan oleh komunitas (opsional)</label>
            <select className={field} value={hostingCommunityUuid} onChange={(e) => setHostingCommunityUuid(e.target.value)}>
              <option value="">— Acara mandiri (tidak terikat komunitas) —</option>
              {myCommunities.map((c) => (
                <option key={c.uuid} value={c.uuid}>{c.name}</option>
              ))}
            </select>
            {myCommunities.length === 0 && (
              <p className="mt-1.5 text-xs text-gray-400">
                Belum punya komunitas yang aktif.{" "}
                <Link href="/dashboard/user/create-community" className="font-semibold text-teal-600 hover:underline">
                  Buat komunitas dulu →
                </Link>
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Step: Waktu ── */}
      {step === "waktu" && (
        <div className={card}>
          <p className={sectionTitle}>🕐 Waktu</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Mulai *</label>
              <input className={field} type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </div>
            <div>
              <label className={label}>Selesai (opsional)</label>
              <input className={field} type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} min={startsAt} />
            </div>
          </div>
          <div>
            <label className={label}>Zona waktu</label>
            <select className={field} value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              {["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura", "Asia/Singapore", "UTC"].map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-gray-700">
            <input type="checkbox" checked={isAllDay} onChange={(e) => setIsAllDay(e.target.checked)} className="h-4 w-4 rounded border-gray-300 accent-teal-500" />
            Acara seharian (sembunyikan jam)
          </label>
        </div>
      )}

      {/* ── Step: Tempat ── */}
      {step === "tempat" && (
        <div className={card}>
          <p className={sectionTitle}>📍 Tempat & format</p>
          <div>
            <label className={label}>Format *</label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {([
                { v: "physical", label: "Tatap muka", emoji: "🏢" },
                { v: "online", label: "Online", emoji: "💻" },
                { v: "hybrid", label: "Hybrid", emoji: "🔀" },
              ] as const).map((opt) => (
                <button key={opt.v} type="button" onClick={() => setFormat(opt.v)}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-xs font-bold transition ${format === opt.v ? "border-teal-500 bg-teal-50 text-teal-800" : "border-gray-200 bg-white text-gray-600 hover:border-teal-200"}`}
                >
                  <span className="text-xl">{opt.emoji}</span> {opt.label}
                </button>
              ))}
            </div>
          </div>
          {(format === "physical" || format === "hybrid") && (
            <>
              <div>
                <label className={label}>Nama venue / tempat</label>
                <input className={field} value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="mis. Aula Kreatif Bandung, Kafe Senja" />
              </div>
              <div className="rounded-2xl border border-teal-100 bg-teal-50/30 p-4">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-teal-700">📍 Lokasi & Peta</p>
                <LocationPicker
                  value={location}
                  onChange={setLocation}
                  accent="teal"
                  required={format === "physical"}
                />
              </div>
            </>
          )}
          {(format === "online" || format === "hybrid") && (
            <div>
              <label className={label}>URL meeting *</label>
              <input className={field} type="url" value={onlineUrl} onChange={(e) => setOnlineUrl(e.target.value)} placeholder="https://meet.google.com/…" />
            </div>
          )}
        </div>
      )}

      {/* ── Step: Kapasitas & akses ── */}
      {step === "kapasitas" && (
        <div className="space-y-5">
          <div className={card}>
            <p className={sectionTitle}>👁️ Visibilitas & akses bergabung</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>Visibilitas</label>
                <select className={field} value={visibility} onChange={(e) => setVisibility(e.target.value as "public" | "unlisted" | "private")}>
                  <option value="public">Publik (muncul di pencarian)</option>
                  <option value="unlisted">Unlisted (hanya lewat link)</option>
                  <option value="private">Privat (khusus undangan)</option>
                </select>
              </div>
              <div>
                <label className={label}>Kebijakan bergabung</label>
                <select className={field} value={joinPolicy} onChange={(e) => setJoinPolicy(e.target.value as "open" | "restricted")}>
                  <option value="open">Terbuka (siapa pun bisa gabung)</option>
                  <option value="restricted">Terbatas (hanya yang di allowlist)</option>
                </select>
              </div>
            </div>
          </div>

          <div className={card}>
            <p className={sectionTitle}>🎟️ Kapasitas</p>
            <div>
              <label className={label}>Maks. peserta (kosong = tidak dibatasi)</label>
              <input className={field} type="number" min="1" value={maxAttendees} onChange={(e) => setMaxAttendees(e.target.value)} placeholder="50" />
            </div>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-gray-700">
                <input type="checkbox" checked={waitlist} onChange={(e) => setWaitlist(e.target.checked)} className="h-4 w-4 rounded accent-teal-500" />
                Aktifkan waitlist jika penuh
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-gray-700">
                <input type="checkbox" checked={requiresApproval} onChange={(e) => setRequiresApproval(e.target.checked)} className="h-4 w-4 rounded accent-teal-500" />
                RSVP perlu persetujuan host
              </label>
              <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-gray-700">
                <input type="checkbox" checked={allowGuest} onChange={(e) => setAllowGuest(e.target.checked)} className="h-4 w-4 rounded accent-teal-500" />
                Peserta boleh bawa tamu
              </label>
            </div>
            {allowGuest && (
              <div>
                <label className={label}>Maks. tamu per peserta</label>
                <input className={field} type="number" min="1" max="10" value={maxGuestPerAttendee} onChange={(e) => setMaxGuestPerAttendee(e.target.value)} placeholder="2" />
              </div>
            )}
          </div>

          <div className={card}>
            <p className={sectionTitle}>💰 Tiket & biaya</p>
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-gray-700">
              <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} className="h-4 w-4 rounded accent-teal-500" />
              Acara gratis
            </label>
            {!isFree && (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className={label}>Harga</label>
                  <input className={field} type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="50000" />
                </div>
                <div>
                  <label className={label}>Mata uang</label>
                  <select className={field} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option value="IDR">IDR</option>
                    <option value="USD">USD</option>
                    <option value="SGD">SGD</option>
                  </select>
                </div>
              </div>
            )}
            <div>
              <label className={label}>URL tiket eksternal (opsional)</label>
              <input className={field} type="url" value={ticketUrl} onChange={(e) => setTicketUrl(e.target.value)} placeholder="https://loket.com/…" />
            </div>
            <div>
              <label className={label}>Apa yang perlu dibawa (opsional)</label>
              <textarea className={`${field} min-h-[4rem] resize-y`} value={whatToBring} onChange={(e) => setWhatToBring(e.target.value)} placeholder="Laptop, buku catatan, semangat…" />
            </div>
            <div>
              <label className={label}>Aturan house rules (opsional)</label>
              <textarea className={`${field} min-h-[4rem] resize-y`} value={houseRules} onChange={(e) => setHouseRules(e.target.value)} placeholder="Harap tepat waktu. Saling menghormati…" />
            </div>
          </div>
        </div>
      )}

      {/* ── Step: Review ── */}
      {step === "review" && (
        <div className="space-y-5">
          <div className={card}>
            <p className={sectionTitle}>🚀 Tinjau & Publikasikan</p>
            <p className="text-sm text-gray-600">
              Acaramu akan langsung <strong>dipublikasikan</strong> dan bisa ditemukan di halaman Jelajahi — tanpa perlu menunggu moderasi.
            </p>
            {(() => { const t = getStoredToken(); return t ? <QuotaBadge token={t} type="event" /> : null; })()}
          </div>

          {/* Summary card */}
          <div className="rounded-3xl border border-teal-100 bg-teal-50/40 p-6 space-y-4">
            <div className="flex items-start gap-3">
              {coverUrl && (
                <div className="shrink-0 space-y-1">
                  <img src={coverUrl} alt="" className="h-20 w-28 rounded-2xl object-cover shadow" />
                  {galleryUrls.length > 0 && (
                    <div className="flex gap-1">
                      {galleryUrls.slice(0, 4).map((u, i) => (
                        <img key={i} src={u} alt="" className="h-8 w-8 rounded-lg object-cover shadow-sm" />
                      ))}
                      {galleryUrls.length > 4 && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 text-[10px] font-bold text-gray-600">
                          +{galleryUrls.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              <div>
                <p className="text-lg font-extrabold text-gray-900">{title}</p>
                {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
                <div className="mt-1 flex flex-wrap gap-2 text-xs font-semibold text-teal-700">
                  <span>{gatheringType.replace(/_/g, " ")}</span>
                  <span>·</span>
                  <span>{format}</span>
                  <span>·</span>
                  <span>{visibility}</span>
                  <span>·</span>
                  <span>{joinPolicy}</span>
                </div>
              </div>
            </div>
            {summary && <p className="text-sm leading-relaxed text-gray-700">{summary}</p>}
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 sm:grid-cols-4">
              <span>📅 {new Date(startsAt).toLocaleString("id-ID", { timeZone: timezone })}</span>
              {endsAt && <span>⏱ s/d {new Date(endsAt).toLocaleTimeString("id-ID", { timeZone: timezone })}</span>}
              {location.city && <span>📍 {venueName ? `${venueName}, ` : ""}{location.city}{location.province ? `, ${location.province}` : ""}</span>}
              {onlineUrl && <span>💻 Online</span>}
              <span>{isFree ? "🎟️ Gratis" : `💰 ${currency} ${Number(price).toLocaleString("id-ID")}`}</span>
              {maxAttendees && <span>👥 Maks {maxAttendees}</span>}
            </div>
            {tags && (
              <div className="flex flex-wrap gap-1.5">
                {parseTagsInput(tags).map((t) => (
                  <span key={t} className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-teal-700 ring-1 ring-teal-200">#{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-6">
        <div className="flex gap-2">
          {currentIdx > 0 && (
            <button type="button" onClick={goPrev} className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
              ← Kembali
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {step !== "review" && (
            <button type="button" onClick={goNext} className="rounded-full bg-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow transition hover:brightness-105">
              Lanjut →
            </button>
          )}
          {step === "review" && (
            <>
              <button
                type="button"
                disabled={saving || submitting}
                onClick={() => void saveDraft()}
                className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                {saving ? "Menyimpan…" : "Simpan sebagai draft"}
              </button>
              <button
                type="button"
                disabled={saving || submitting}
                onClick={() => void saveAndSubmit()}
                className="rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-400/30 transition hover:brightness-105 disabled:opacity-50"
              >
                {submitting ? "Memublikasikan…" : "Publikasikan Acara 🚀"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

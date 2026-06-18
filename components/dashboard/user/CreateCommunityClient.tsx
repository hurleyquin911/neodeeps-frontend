"use client";

import { useState } from "react";
import Link from "next/link";
import { createCommunity, submitCommunityForReview, type CreateCommunityPayload } from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { LocationPicker, type LocationValue } from "@/components/ui/LocationPicker";
import QuotaBadge from "@/components/ui/QuotaBadge";

const field =
  "mt-1.5 w-full rounded-2xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[15px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-200/40 disabled:opacity-55";
const label = "block text-sm font-semibold text-gray-700";
const sectionTitle = "text-xs font-bold uppercase tracking-[0.2em] text-teal-700";
const card = "rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-5";

function parseTagsInput(raw: string): string[] {
  return raw
    .split(/[,\s]+/)
    .map((t) => t.trim().toLowerCase().replace(/^#/, ""))
    .filter(Boolean);
}

type Step = "info" | "lokasi" | "akses" | "review";
const STEPS: { key: Step; label: string; emoji: string }[] = [
  { key: "info", label: "Info komunitas", emoji: "🏘️" },
  { key: "lokasi", label: "Lokasi", emoji: "📍" },
  { key: "akses", label: "Akses & aturan", emoji: "🔒" },
  { key: "review", label: "Tinjau & kirim", emoji: "🚀" },
];

const CATEGORIES = [
  "meetup", "social", "sports", "arts", "education", "tech",
  "business", "music", "food", "travel", "gaming", "wellness", "other",
];

export function CreateCommunityClient() {
  const [step, setStep] = useState<Step>("info");

  /* form state */
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState<"public" | "unlisted" | "private">("public");
  const [joinPolicy, setJoinPolicy] = useState<"open" | "restricted">("open");
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [organizerName, setOrganizerName] = useState("");
  const [organizerEmail, setOrganizerEmail] = useState("");
  const [organizerWebsite, setOrganizerWebsite] = useState("");
  const [houseRules, setHouseRules] = useState("");
  const [location, setLocation] = useState<LocationValue>({
    address_line: "", city: "", province: "", postal_code: "",
    country_code: "ID", latitude: null, longitude: null,
  });

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftUuid, setDraftUuid] = useState<string | null>(null);
  const [success, setSuccess] = useState<"draft" | "submitted" | null>(null);

  function validateStep(s: Step): string | null {
    if (s === "info") {
      if (!name.trim()) return "Nama komunitas wajib diisi.";
      if (name.trim().length < 2) return "Nama minimal 2 karakter.";
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

  function buildPayload(): CreateCommunityPayload {
    return {
      name: name.trim(),
      subtitle: subtitle.trim() || undefined,
      description: description.trim() || undefined,
      cover_image_url: coverUrl.trim() || undefined,
      avatar_url: avatarUrl.trim() || undefined,
      primary_category: category || undefined,
      tags: tags.trim() ? parseTagsInput(tags) : undefined,
      visibility,
      join_policy: joinPolicy,
      requires_host_approval: requiresApproval,
      organizer_display_name: organizerName.trim() || undefined,
      organizer_email: organizerEmail.trim() || undefined,
      organizer_website_url: organizerWebsite.trim() || undefined,
      house_rules: houseRules.trim() || undefined,
      // Lokasi
      address_line: location.address_line.trim() || undefined,
      address_line_2: location.address_line_2?.trim() || undefined,
      city: location.city.trim() || undefined,
      province: location.province.trim() || undefined,
      postal_code: location.postal_code.trim() || undefined,
      country_code: location.country_code || undefined,
      latitude: location.latitude ?? undefined,
      longitude: location.longitude ?? undefined,
    };
  }

  async function saveDraft() {
    const token = getStoredToken();
    if (!token) { setError("Sesi habis. Silakan masuk kembali."); return; }
    setSaving(true);
    setError(null);
    try {
      const com = await createCommunity(token, buildPayload());
      setDraftUuid(com.uuid);
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
        const com = await createCommunity(token, buildPayload());
        uuid = com.uuid;
        setDraftUuid(uuid);
      }
      await submitCommunityForReview(token, uuid);
      setSuccess("submitted");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengirim.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-6 py-20 text-center">
        <span className="text-6xl">{success === "submitted" ? "🎉" : "✅"}</span>
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">
            {success === "submitted" ? "Komunitas dipublikasikan! 🎉" : "Draft tersimpan!"}
          </h2>
          <p className="mt-2 max-w-sm text-base text-gray-600">
            {success === "submitted"
              ? "Komunitasmu sudah aktif dan bisa ditemukan di halaman Jelajahi sekarang."
              : "Komunitasmu tersimpan sebagai draft. Kamu bisa publikasikan kapan saja dari halaman Komunitas Saya."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/user/communities" className="rounded-full bg-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow hover:brightness-105">
            Lihat Komunitas Saya
          </Link>
          <button type="button" onClick={() => {
            setSuccess(null); setDraftUuid(null); setName(""); setDescription("");
            setStep("info"); setError(null);
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
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">Buat komunitas baru 🏘️</h1>
          <p className="mt-1 text-sm text-gray-500">Komunitas berbeda dari acara — ini adalah grup persisten yang bisa orang ikuti kapan saja.</p>
        </div>
        <Link href="/dashboard/user/communities" className="shrink-0 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
          ← Kembali
        </Link>
      </header>

      {/* Callout pembeda */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <span className="mt-0.5 shrink-0 text-xl">💡</span>
        <div className="text-sm text-amber-900">
          <strong>Komunitas vs Acara:</strong> Komunitas adalah tempat berkumpul secara persisten.
          Setelah komunitasmu aktif, kamu bisa membuat <strong>acara</strong> yang diselenggarakan oleh komunitas ini — tapi keduanya bisa berdiri sendiri-sendiri.
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <button
              type="button"
              onClick={() => { if (i < currentIdx) { setError(null); setStep(s.key); } }}
              className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold transition ${
                s.key === step ? "bg-teal-500 text-white shadow" : i < currentIdx ? "bg-teal-50 text-teal-700 hover:bg-teal-100" : "bg-gray-100 text-gray-400"
              }`}
            >
              <span>{s.emoji}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && <div className={`h-0.5 w-4 shrink-0 sm:w-6 ${i < currentIdx ? "bg-teal-300" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>
      )}

      {/* ── Step: Info ── */}
      {step === "info" && (
        <div className={card}>
          <p className={sectionTitle}>🏘️ Identitas komunitas</p>

          <div>
            <label className={label}>Nama komunitas *</label>
            <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="mis. Komunitas Pelari Bandung" maxLength={255} />
            <p className="mt-1 text-right text-xs text-gray-400">{name.length}/255</p>
          </div>
          <div>
            <label className={label}>Tagline (opsional)</label>
            <input className={field} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Satu kalimat yang menggambarkan komunitasmu" maxLength={500} />
          </div>
          <div>
            <label className={label}>Deskripsi (opsional)</label>
            <textarea className={`${field} min-h-[8rem] resize-y`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ceritakan tentang komunitas ini: tujuan, kegiatan rutin, siapa yang cocok bergabung…" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <ImageUploader
              label="Foto profil / logo"
              value={avatarUrl}
              onChange={setAvatarUrl}
              shape="square"
              hint="JPG, PNG, WebP, GIF — maks 5 MB"
            />
            <ImageUploader
              label="Cover banner"
              value={coverUrl}
              onChange={setCoverUrl}
              shape="wide"
              hint="Rasio 16:9 disarankan — maks 5 MB"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Kategori</label>
              <select className={field} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Pilih…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Tag (pisah dengan koma)</label>
              <input className={field} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="bandung lari olahraga" />
            </div>
          </div>
          {tags && (
            <div className="flex flex-wrap gap-1.5">
              {parseTagsInput(tags).map((t) => (
                <span key={t} className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700">#{t}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Step: Lokasi ── */}
      {step === "lokasi" && (
        <div className={card}>
          <p className={sectionTitle}>📍 Lokasi & Peta</p>
          <p className="text-sm text-gray-500">
            Tambahkan lokasi komunitas — bisa berupa sekretariat, tempat berkumpul rutin, atau kota domisili.
            Lokasi ini akan ditampilkan di halaman komunitas dan membantu anggota menemukan tempatmu di peta.
          </p>
          <LocationPicker
            value={location}
            onChange={setLocation}
            accent="amber"
          />
        </div>
      )}

      {/* ── Step: Akses ── */}
      {step === "akses" && (
        <div className="space-y-5">
          <div className={card}>
            <p className={sectionTitle}>👁️ Visibilitas & kebijakan</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>Visibilitas</label>
                <select className={field} value={visibility} onChange={(e) => setVisibility(e.target.value as typeof visibility)}>
                  <option value="public">Publik — muncul di pencarian</option>
                  <option value="unlisted">Unlisted — hanya lewat link</option>
                  <option value="private">Privat — khusus undangan</option>
                </select>
              </div>
              <div>
                <label className={label}>Siapa bisa bergabung</label>
                <select className={field} value={joinPolicy} onChange={(e) => setJoinPolicy(e.target.value as typeof joinPolicy)}>
                  <option value="open">Terbuka — siapa pun bisa langsung gabung</option>
                  <option value="restricted">Terbatas — hanya dari allowlist</option>
                </select>
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-gray-700">
              <input type="checkbox" checked={requiresApproval} onChange={(e) => setRequiresApproval(e.target.checked)} className="h-4 w-4 rounded accent-teal-500" />
              Bergabung perlu persetujuan dari owner/admin
            </label>
            <div>
              <label className={label}>Aturan komunitas (opsional)</label>
              <textarea className={`${field} min-h-[6rem] resize-y`} value={houseRules} onChange={(e) => setHouseRules(e.target.value)} placeholder="Saling menghormati. Tidak ada spam…" />
            </div>
          </div>

          <div className={card}>
            <p className={sectionTitle}>📞 Kontak penyelenggara (opsional)</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>Nama yang ditampilkan</label>
                <input className={field} value={organizerName} onChange={(e) => setOrganizerName(e.target.value)} placeholder="Tim Komunitas Pelari" />
              </div>
              <div>
                <label className={label}>Email kontak</label>
                <input className={field} type="email" value={organizerEmail} onChange={(e) => setOrganizerEmail(e.target.value)} placeholder="halo@komunitas.id" />
              </div>
            </div>
            <div>
              <label className={label}>Website</label>
              <input className={field} type="url" value={organizerWebsite} onChange={(e) => setOrganizerWebsite(e.target.value)} placeholder="https://…" />
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
              Komunitasmu akan langsung <strong>dipublikasikan</strong> dan bisa ditemukan di halaman Jelajahi — tanpa perlu menunggu moderasi.
            </p>
            {(() => { const t = getStoredToken(); return t ? <QuotaBadge token={t} type="community" /> : null; })()}
          </div>

          <div className="rounded-3xl border border-teal-100 bg-teal-50/40 p-6 space-y-4">
            <div className="flex items-start gap-4">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-16 w-16 rounded-2xl object-cover shadow" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-200 text-2xl font-extrabold text-teal-800">
                  {name.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <div>
                <p className="text-xl font-extrabold text-gray-900">{name || "–"}</p>
                {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
                <div className="mt-1 flex flex-wrap gap-2 text-xs font-semibold text-teal-700">
                  {category && <span>{category}</span>}
                  <span>·</span>
                  <span>{visibility}</span>
                  <span>·</span>
                  <span>{joinPolicy === "open" ? "Terbuka" : "Terbatas"}</span>
                  {requiresApproval && <><span>·</span><span>Perlu persetujuan</span></>}
                </div>
              </div>
            </div>
            {description && <p className="text-sm leading-relaxed text-gray-700">{description}</p>}
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

      {/* Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-6">
        <div>
          {currentIdx > 0 && (
            <button type="button" onClick={goPrev} className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              ← Kembali
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {step !== "review" && (
            <button type="button" onClick={goNext} className="rounded-full bg-teal-500 px-6 py-2.5 text-sm font-bold text-white shadow hover:brightness-105">
              Lanjut →
            </button>
          )}
          {step === "review" && (
            <>
              <button type="button" disabled={saving || submitting} onClick={() => void saveDraft()}
                className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                {saving ? "Menyimpan…" : "Simpan draft"}
              </button>
              <button type="button" disabled={saving || submitting} onClick={() => void saveAndSubmit()}
                className="rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-400/30 hover:brightness-105 disabled:opacity-50">
                {submitting ? "Memublikasikan…" : "Publikasikan Komunitas 🚀"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

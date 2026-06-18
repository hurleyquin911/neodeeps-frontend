"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { UserMe } from "@/lib/api";
import { fetchMe, getApiBase, updateMyProfile, uploadImage } from "@/lib/api";
import { getStoredToken, setSession } from "@/lib/auth-storage";
const LS_REDUCE_MOTION = "neodeeps_pref_reduce_motion";
const LS_COMPACT_CARDS = "neodeeps_pref_compact_cards";
const fieldClass =
  "mt-1.5 w-full rounded-2xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[15px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-200/45 disabled:opacity-55";
function toDateInputValue(v: unknown): string {
  if (typeof v !== "string" || !v) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  return "";
}
function SegmentCard({
  eyebrow,
  title,
  description,
  children,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_-20px_rgba(0,0,0,0.08)]">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-extrabold tracking-tight text-gray-900">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
        {description}
      </p>
      <div className="mt-6 space-y-5">{children}</div>
      {actions ? (
        <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-6">
          {actions}
        </div>
      ) : null}
    </section>
  );
}
export function UserSettingsClient() {
  const [apiOk, setApiOk] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [occupation, setOccupation] = useState("");
  const [education, setEducation] = useState("");
  const [language, setLanguage] = useState("");
  const [religion, setReligion] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [profileVideoUrl, setProfileVideoUrl] = useState("");
  const [profilePhotos, setProfilePhotos] = useState<string[]>([]);
  const [profileBannerUrl, setProfileBannerUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [photoSaveMsg, setPhotoSaveMsg] = useState<string | null>(null);
  const [photoSaveErr, setPhotoSaveErr] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [favoriteMusic, setFavoriteMusic] = useState("");
  const [favoriteMovies, setFavoriteMovies] = useState("");
  const [favoriteFood, setFavoriteFood] = useState("");
  const [zodiac, setZodiac] = useState("");
  const [mbti, setMbti] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [msgPrivacy, setMsgPrivacy] = useState<string | null>(null);
  const [errPrivacy, setErrPrivacy] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [compactCards, setCompactCards] = useState(false);
  const [msg1, setMsg1] = useState<string | null>(null);
  const [msg2, setMsg2] = useState<string | null>(null);
  const [msg3, setMsg3] = useState<string | null>(null);
  const [err1, setErr1] = useState<string | null>(null);
  const [err2, setErr2] = useState<string | null>(null);
  const [err3, setErr3] = useState<string | null>(null);
  const [saving1, setSaving1] = useState(false);
  const [saving2, setSaving2] = useState(false);
  const [saving3, setSaving3] = useState(false);
  const [verifiedHint, setVerifiedHint] = useState<string | null>(null);
  const applyUserToForm = useCallback((u: UserMe) => {
    setName(u.name ?? "");
    setUsername(u.username ?? "");
    setEmail(u.email ?? "");
    setPhone((u.phone as string) ?? "");
    setBirthDate(toDateInputValue(u.birth_date));
    setGender((u.gender as string) ?? "");
    setAddress((u.address as string) ?? "");
    setCity((u.city as string) ?? "");
    setOccupation((u.occupation as string) ?? "");
    setEducation((u.education as string) ?? "");
    setLanguage((u.language as string) ?? "id");
    setReligion((u.religion as string) ?? "");
    setProfilePhotoUrl((u.profile_photo_url as string) ?? "");
    setProfileVideoUrl((u.profile_video_url as string) ?? "");
    setBio((u.bio as string) ?? "");
    setHobbies((u.hobbies as string) ?? "");
    setFavoriteMusic((u.favorite_music as string) ?? "");
    setFavoriteMovies((u.favorite_movies as string) ?? "");
    setFavoriteFood((u.favorite_food as string) ?? "");
    setZodiac((u.zodiac as string) ?? "");
    setMbti((u.mbti as string) ?? "");
    setIsPrivate(!!(u as unknown as { is_private?: boolean }).is_private);
    const photos = (u as unknown as { profile_photos?: string[] }).profile_photos;
    setProfilePhotos(Array.isArray(photos) ? photos : []);
    setProfileBannerUrl((u as unknown as { profile_banner_url?: string }).profile_banner_url ?? "");
    if (u.email_verified_at) {
      const d = new Date(u.email_verified_at);
      setVerifiedHint(
        Number.isNaN(d.getTime())
          ? "Email terverifikasi."
          : `Email terverifikasi · ${d.toLocaleString("id-ID")}`,
      );
    } else {
      setVerifiedHint("Email belum diverifikasi (alur verifikasi menyusul).");
    }
  }, []);
  useEffect(() => {
    try {
      getApiBase();
      setApiOk(true);
    } catch {
      setApiOk(false);
    }
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduceMotion(localStorage.getItem(LS_REDUCE_MOTION) === "1");
    setCompactCards(localStorage.getItem(LS_COMPACT_CARDS) === "1");
  }, []);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      const t = getStoredToken();
      setToken(t);
      if (!t) {
        setLoading(false);
        setLoadError(
          "Anda belum masuk. Silakan login untuk mengubah pengaturan.",
        );
        return;
      }
      if (!apiOk) {
        setLoading(false);
        setLoadError("API belum dikonfigurasi.");
        return;
      }
      try {
        const u = await fetchMe(t);
        if (!cancelled) applyUserToForm(u);
      } catch (e) {
        if (!cancelled)
          setLoadError(e instanceof Error ? e.message : "Gagal memuat profil.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiOk, applyUserToForm]);
  function syncSession(u: UserMe) {
    const t = getStoredToken();
    if (t) setSession(t, u);
  }

  /** Simpan foto profil utama langsung setelah upload — tanpa harus klik Simpan */
  async function savePhotoNow(newUrl: string) {
    const t = getStoredToken();
    if (!t) return;
    setPhotoSaveMsg(null);
    setPhotoSaveErr(null);
    try {
      const u = await updateMyProfile(t, { profile_photo_url: newUrl });
      applyUserToForm(u);
      syncSession(u);
      setPhotoSaveMsg("✅ Foto profil berhasil disimpan!");
      setTimeout(() => setPhotoSaveMsg(null), 3000);
    } catch (e) {
      setPhotoSaveErr(e instanceof Error ? e.message : "Gagal menyimpan foto profil.");
    }
  }

  /** Simpan banner profil langsung setelah upload */
  async function saveBannerNow(newUrl: string) {
    const t = getStoredToken();
    if (!t) return;
    setPhotoSaveMsg(null);
    setPhotoSaveErr(null);
    try {
      const u = await updateMyProfile(t, { profile_banner_url: newUrl || null });
      applyUserToForm(u);
      syncSession(u);
      setPhotoSaveMsg("✅ Banner profil berhasil disimpan!");
      setTimeout(() => setPhotoSaveMsg(null), 3000);
    } catch (e) {
      setPhotoSaveErr(e instanceof Error ? e.message : "Gagal menyimpan banner.");
    }
  }

  /** Simpan galeri foto langsung setelah tambah/hapus */
  async function saveGalleryNow(newPhotos: string[]) {
    const t = getStoredToken();
    if (!t) return;
    setPhotoSaveMsg(null);
    setPhotoSaveErr(null);
    try {
      const u = await updateMyProfile(t, { profile_photos: newPhotos.length > 0 ? newPhotos : null });
      applyUserToForm(u);
      syncSession(u);
      setPhotoSaveMsg("✅ Galeri berhasil diperbarui!");
      setTimeout(() => setPhotoSaveMsg(null), 3000);
    } catch (e) {
      setPhotoSaveErr(e instanceof Error ? e.message : "Gagal menyimpan galeri.");
    }
  }
  async function saveSegment1() {
    const t = getStoredToken();
    if (!t) return;
    setErr1(null);
    setMsg1(null);
    setSaving1(true);
    try {
      const u = await updateMyProfile(t, {
        name: name.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        birth_date: birthDate,
        gender: gender.trim(),
        address: address.trim(),
        city: city.trim(),
        occupation: occupation.trim(),
        education: education.trim(),
        language: language.trim(),
        religion: religion.trim() || null,
        profile_photo_url: profilePhotoUrl.trim() || null,
        profile_video_url: profileVideoUrl.trim() || null,
        profile_photos: profilePhotos.length > 0 ? profilePhotos : null,
        profile_banner_url: profileBannerUrl.trim() || null,
      });
      applyUserToForm(u);
      syncSession(u);
      setMsg1("Informasi pribadi disimpan.");
    } catch (e) {
      setErr1(e instanceof Error ? e.message : "Gagal menyimpan.");
    } finally {
      setSaving1(false);
    }
  }
  async function saveSegment2() {
    const t = getStoredToken();
    if (!t) return;
    setErr2(null);
    setMsg2(null);
    setSaving2(true);
    try {
      const u = await updateMyProfile(t, {
        bio: bio.trim() || null,
        hobbies: hobbies.trim() || null,
        favorite_music: favoriteMusic.trim() || null,
        favorite_movies: favoriteMovies.trim() || null,
        favorite_food: favoriteFood.trim() || null,
        zodiac: zodiac.trim() || null,
        mbti: mbti.trim() || null,
      });
      applyUserToForm(u);
      syncSession(u);
      setMsg2("Profil “tentang Anda” disimpan.");
    } catch (e) {
      setErr2(e instanceof Error ? e.message : "Gagal menyimpan.");
    } finally {
      setSaving2(false);
    }
  }
  async function saveSegment3Password() {
    const t = getStoredToken();
    if (!t) return;
    setErr3(null);
    setMsg3(null);
    if (!passwordNew && !passwordConfirm) {
      setErr3("Isi kata sandi baru jika ingin mengganti.");
      return;
    }
    if (passwordNew.length < 8) {
      setErr3("Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (passwordNew !== passwordConfirm) {
      setErr3("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    setSaving3(true);
    try {
      const u = await updateMyProfile(t, { password: passwordNew });
      applyUserToForm(u);
      syncSession(u);
      setPasswordNew("");
      setPasswordConfirm("");
      setMsg3("Kata sandi diperbarui.");
    } catch (e) {
      setErr3(e instanceof Error ? e.message : "Gagal mengganti kata sandi.");
    } finally {
      setSaving3(false);
    }
  }
  function saveLocalPrefs() {
    setErr3(null);
    setMsg3(null);
    try {
      localStorage.setItem(LS_REDUCE_MOTION, reduceMotion ? "1" : "0");
      localStorage.setItem(LS_COMPACT_CARDS, compactCards ? "1" : "0");
      setMsg3("Preferensi perangkat disimpan di browser Anda.");
    } catch {
      setErr3("Penyimpanan lokal tidak tersedia di peramban ini.");
    }
  }
  if (!apiOk) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800   ">
        {" "}
        <p className="font-medium">API belum dikonfigurasi</p>{" "}
        <p className="mt-1 text-amber-800/90 ">
          Atur variabel NEXT_PUBLIC_API_BASE_URL lalu muat ulang halaman ini.
        </p>{" "}
      </div>
    );
  }
  if (loading) {
    return (
      <div className="space-y-6">
        {" "}
        <div className="h-10 w-2/3 max-w-md animate-pulse rounded-lg bg-teal-100 " />{" "}
        <div className="h-52 animate-pulse rounded-2xl bg-teal-100 " />{" "}
        <div className="h-52 animate-pulse rounded-2xl bg-teal-100 " />{" "}
      </div>
    );
  }
  if (loadError || !token) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-800   ">
        {" "}
        <p className="font-medium">{loadError ?? "Silakan masuk"}</p>{" "}
        <Link
          href="/login"
          className="mt-3 inline-flex text-sm font-semibold text-red-700 underline-offset-4 hover:underline "
        >
          {" "}
          Ke halaman masuk →{" "}
        </Link>{" "}
      </div>
    );
  }
  return (
    <div className="space-y-10">
      {" "}
      <header className="max-w-3xl space-y-2">
        {" "}
        <p className="text-xs font-semibold uppercase tracking-[0.2em] font-bold text-teal-700 ">
          Pengguna
        </p>{" "}
        <h1 className="text-3xl font-bold tracking-tight text-gray-900  sm:text-4xl">
          Pengaturan
        </h1>{" "}
        <p className="text-base leading-relaxed text-gray-600 ">
          {" "}
          Kelola data diri Anda, profil sosial untuk komunitas, serta preferensi
          aplikasi dan keamanan akun — disegment agar lebih mudah diikuti.{" "}
        </p>{" "}
      </header>{" "}
      <SegmentCard
        eyebrow="Segmen 1"
        title="Informasi akun & pribadi"
        description="Identitas dasar untuk masuk serta data profil utama yang digunakan di platform ini (nama, kota, kontak, dan foto profil)."
        actions={
          <>
            {" "}
            {msg1 ? (
              <span className="text-sm font-medium font-bold text-teal-700 ">
                {msg1}
              </span>
            ) : null}{" "}
            <button
              type="button"
              disabled={saving1}
              onClick={() => void saveSegment1()}
              className="rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-400/30 transition hover:brightness-105 disabled:opacity-45"
            >
              {" "}
              {saving1 ? "Menyimpan…" : "Simpan segmen ini"}{" "}
            </button>{" "}
          </>
        }
      >
        {" "}
        {err1 ? <p className="text-sm text-red-600 ">{err1}</p> : null}{" "}
        <div className="grid gap-5 sm:grid-cols-2">
          {" "}
          <div className="sm:col-span-2">
            {" "}
            <label className="text-sm font-semibold text-gray-700 ">
              Nama lengkap
            </label>{" "}
            <input
              className={fieldClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="text-sm font-semibold text-gray-700 ">
              Nama pengguna
            </label>{" "}
            <input
              className={fieldClass}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="text-sm font-semibold text-gray-700 ">
              Email
            </label>{" "}
            <input
              className={fieldClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="text-sm font-semibold text-gray-700 ">
              Nomor telepon
            </label>{" "}
            <input
              className={fieldClass}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="text-sm font-semibold text-gray-700 ">
              Tanggal lahir
            </label>{" "}
            <input
              className={fieldClass}
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />{" "}
          </div>{" "}
          <div className="sm:col-span-2">
            {" "}
            <label className="text-sm font-semibold text-gray-700 ">
              Gender
            </label>{" "}
            <select
              className={fieldClass}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              {" "}
              <option value="">Pilih…</option>{" "}
              <option value="male">Laki-laki</option>{" "}
              <option value="female">Perempuan</option>{" "}
              <option value="other">Lainnya</option>{" "}
              <option value="prefer_not_to_say">
                Prefer tidak menyebutkan
              </option>{" "}
            </select>{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="text-sm font-semibold text-gray-700 ">
              Kota
            </label>{" "}
            <input
              className={fieldClass}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="text-sm font-semibold text-gray-700 ">
              Pekerjaan
            </label>{" "}
            <input
              className={fieldClass}
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
            />{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="text-sm font-semibold text-gray-700 ">
              Pendidikan
            </label>{" "}
            <input
              className={fieldClass}
              value={education}
              onChange={(e) => setEducation(e.target.value)}
            />{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="text-sm font-semibold text-gray-700 ">
              Bahasa utama
            </label>{" "}
            <input
              className={fieldClass}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="id"
            />{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="text-sm font-semibold text-gray-700 ">
              Agama
            </label>{" "}
            <input
              className={fieldClass}
              value={religion}
              onChange={(e) => setReligion(e.target.value)}
            />{" "}
          </div>{" "}
          <div className="sm:col-span-2">
            {" "}
            <label className="text-sm font-semibold text-gray-700 ">
              Alamat
            </label>{" "}
            <textarea
              className={`${fieldClass} min-h-[5.5rem] resize-y`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />{" "}
          </div>{" "}
          {/* ── Banner / Cover profil ── */}
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Foto Banner Profil</label>
            <p className="text-[11px] text-gray-400 mb-2">Gambar lebar yang tampil di bagian atas halaman profilmu</p>
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100" style={{ height: 120 }}>
              {profileBannerUrl ? (
                <img src={profileBannerUrl} alt="Banner" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-teal-400 via-teal-500 to-amber-400">
                  <p className="text-xs font-semibold text-white/80">Belum ada banner</p>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 hover:bg-black/20 transition">
                <label className={`cursor-pointer flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white shadow backdrop-blur-sm hover:bg-black/70 transition ${uploadingBanner ? "pointer-events-none opacity-70" : ""}`}>
                  {uploadingBanner ? "⏳ Mengunggah…" : "📷 Pilih Banner"}
                  <input type="file" accept="image/*" className="hidden" disabled={uploadingBanner}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      const t = getStoredToken();
                      if (!file || !t) { setPhotoSaveErr("Sesi tidak ditemukan. Coba login ulang."); return; }
                      setUploadingBanner(true);
                      setPhotoSaveErr(null);
                      setPhotoSaveMsg(null);
                      try {
                        const url = await uploadImage(t, file);
                        setProfileBannerUrl(url);
                        await saveBannerNow(url);
                      } catch (ex) {
                        setPhotoSaveErr(ex instanceof Error ? ex.message : "Upload gagal. Coba lagi.");
                      } finally {
                        setUploadingBanner(false);
                        e.target.value = "";
                      }
                    }} />
                </label>
                {profileBannerUrl && (
                  <button type="button"
                    onClick={async () => {
                      setProfileBannerUrl("");
                      await saveBannerNow("");
                    }}
                    className="flex items-center gap-1 rounded-full bg-red-500/80 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600/90 transition">
                    🗑️ Hapus
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Foto profil utama (upload file — langsung tersimpan) ── */}
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Foto Profil Utama</label>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              {profilePhotoUrl ? (
                <div className="relative">
                  <img src={profilePhotoUrl} alt="Foto profil" className="h-20 w-20 rounded-full object-cover ring-2 ring-teal-200 shadow" />
                  <button
                    type="button"
                    onClick={async () => {
                      setProfilePhotoUrl("");
                      await savePhotoNow("");
                    }}
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white shadow"
                  >✕</button>
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-3xl text-gray-400 ring-2 ring-dashed ring-gray-200">
                  👤
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className={`cursor-pointer inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-bold text-teal-700 hover:bg-teal-100 transition ${uploadingPhoto ? "opacity-50 pointer-events-none" : ""}`}>
                  {uploadingPhoto ? "⏳ Mengunggah & menyimpan…" : "📷 Pilih & simpan foto"}
                  <input type="file" accept="image/*" className="hidden" disabled={uploadingPhoto}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      const t = getStoredToken();
                      if (!file || !t) { setPhotoSaveErr("Sesi tidak ditemukan. Coba login ulang."); return; }
                      setUploadingPhoto(true);
                      setPhotoSaveErr(null);
                      setPhotoSaveMsg(null);
                      try {
                        const url = await uploadImage(t, file);
                        setProfilePhotoUrl(url);
                        await savePhotoNow(url);
                      } catch (err) {
                        setPhotoSaveErr(err instanceof Error ? err.message : "Upload gagal. Coba lagi.");
                      } finally {
                        setUploadingPhoto(false);
                        e.target.value = "";
                      }
                    }} />
                </label>
                <p className="text-[11px] text-gray-400">JPG, PNG, WebP · maks 5 MB · langsung tersimpan</p>
              </div>
            </div>
            {photoSaveMsg && <p className="mt-2 text-xs font-semibold text-teal-600">{photoSaveMsg}</p>}
            {photoSaveErr && <p className="mt-2 text-xs font-semibold text-red-500">{photoSaveErr}</p>}
          </div>

          {/* ── Galeri foto profil (bisa lebih dari 1 — langsung tersimpan) ── */}
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Galeri Foto <span className="font-normal text-gray-400">(opsional · tampil di profil publik)</span></label>
            <div className="mt-1.5 space-y-3">
              {profilePhotos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profilePhotos.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt="" className="h-20 w-20 rounded-2xl object-cover shadow" />
                      <button
                        type="button"
                        onClick={async () => {
                          const next = profilePhotos.filter((_, j) => j !== i);
                          setProfilePhotos(next);
                          await saveGalleryNow(next);
                        }}
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white shadow"
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
              <label className={`cursor-pointer inline-flex items-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 transition ${uploadingGallery ? "opacity-50 pointer-events-none" : ""}`}>
                {uploadingGallery ? "⏳ Mengunggah & menyimpan…" : "🖼️ Tambah foto ke galeri"}
                <input type="file" accept="image/*" multiple className="hidden" disabled={uploadingGallery}
                  onChange={async (e) => {
                    const files = Array.from(e.target.files ?? []);
                    const t = getStoredToken();
                    if (files.length === 0 || !t) return;
                    setUploadingGallery(true);
                    setPhotoSaveErr(null);
                    setPhotoSaveMsg(null);
                    try {
                      const urls = await Promise.all(files.map((f) => uploadImage(t, f)));
                      const next = [...profilePhotos, ...urls].slice(0, 9);
                      setProfilePhotos(next);
                      await saveGalleryNow(next);
                    } catch (err) {
                      setPhotoSaveErr(err instanceof Error ? err.message : "Upload galeri gagal. Coba lagi.");
                    } finally {
                      setUploadingGallery(false);
                      e.target.value = "";
                    }
                  }} />
              </label>
              <p className="text-[11px] text-gray-400">Maksimal 9 foto · JPG, PNG, WebP · maks 5 MB per file · langsung tersimpan</p>
            </div>
          </div>{" "}
        </div>{" "}
        {verifiedHint ? (
          <p className="text-[13px] text-gray-500 ">{verifiedHint}</p>
        ) : null}{" "}
      </SegmentCard>{" "}
      <SegmentCard
        eyebrow="Segmen 2"
        title="Informasi tentang Anda"
        description="Bagian ini membantu orang lain dalam komunitas mengenali minat dan kepribadian Anda. Semua boleh dikosongkan bila Anda ingin lebih privat."
        actions={
          <>
            {" "}
            {msg2 ? (
              <span className="text-sm font-medium font-bold text-teal-700 ">
                {msg2}
              </span>
            ) : null}{" "}
            <button
              type="button"
              disabled={saving2}
              onClick={() => void saveSegment2()}
              className="rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-400/30 transition hover:brightness-105 disabled:opacity-45"
            >
              {" "}
              {saving2 ? "Menyimpan…" : "Simpan segmen ini"}{" "}
            </button>{" "}
          </>
        }
      >
        {" "}
        {err2 ? <p className="text-sm text-red-600 ">{err2}</p> : null}{" "}
        <div>
          {" "}
          <label className="text-sm font-semibold text-gray-700 ">
            Bio
          </label>{" "}
          <textarea
            className={`${fieldClass} min-h-[6rem] resize-y`}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />{" "}
        </div>{" "}
        <div>
          {" "}
          <label className="text-sm font-semibold text-gray-700 ">
            Hobi
          </label>{" "}
          <input
            className={fieldClass}
            value={hobbies}
            onChange={(e) => setHobbies(e.target.value)}
          />{" "}
        </div>{" "}
        <div className="grid gap-5 sm:grid-cols-2">
          {" "}
          <div>
            {" "}
            <label className="text-sm font-semibold text-gray-700 ">
              Musik favorit
            </label>{" "}
            <input
              className={fieldClass}
              value={favoriteMusic}
              onChange={(e) => setFavoriteMusic(e.target.value)}
            />{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="text-sm font-semibold text-gray-700 ">
              Film favorit
            </label>{" "}
            <input
              className={fieldClass}
              value={favoriteMovies}
              onChange={(e) => setFavoriteMovies(e.target.value)}
            />{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="text-sm font-semibold text-gray-700 ">
              Makanan favorit
            </label>{" "}
            <input
              className={fieldClass}
              value={favoriteFood}
              onChange={(e) => setFavoriteFood(e.target.value)}
            />{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="text-sm font-semibold text-gray-700 ">
              Zodiak
            </label>{" "}
            <input
              className={fieldClass}
              value={zodiac}
              onChange={(e) => setZodiac(e.target.value)}
            />{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="text-sm font-semibold text-gray-700 ">
              MBTI
            </label>{" "}
            <input
              className={fieldClass}
              value={mbti}
              onChange={(e) => setMbti(e.target.value)}
              maxLength={16}
            />{" "}
          </div>{" "}
        </div>{" "}
      </SegmentCard>{" "}
      <SegmentCard
        eyebrow="Segmen 3"
        title="Sistem aplikasi & keamanan"
        description="Preferensi antarmuka disimpan di peramban Anda. Untuk kata sandi, server saat ini hanya memerlukan kata sandi baru —          kami akan menambahkan pemeriksaan kata sandi lama di rilis mendatang."
        actions={
          <>
            {" "}
            {msg3 ? (
              <span className="text-sm font-medium font-bold text-teal-700 ">
                {msg3}
              </span>
            ) : null}{" "}
            <button
              type="button"
              onClick={() => saveLocalPrefs()}
              className="rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50    "
            >
              {" "}
              Simpan preferensi perangkat{" "}
            </button>{" "}
            <button
              type="button"
              disabled={saving3}
              onClick={() => void saveSegment3Password()}
              className="rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-400/30 ring-2 ring-orange-100/80 transition hover:brightness-105 disabled:opacity-45   "
            >
              {" "}
              {saving3 ? "Memproses…" : "Perbarui kata sandi"}{" "}
            </button>{" "}
          </>
        }
      >
        {" "}
        {err3 ? <p className="text-sm text-red-600 ">{err3}</p> : null}{" "}
        <div className="space-y-3 rounded-2xl border border-gray-200 bg-teal-50/50 p-4  ">
          {" "}
          <p className="text-sm font-semibold text-gray-800 ">
            Preferensi tampilan (lokal)
          </p>{" "}
          <label className="flex cursor-pointer items-start gap-3 text-sm font-semibold text-gray-700 ">
            {" "}
            <input
              type="checkbox"
              checked={reduceMotion}
              onChange={(e) => setReduceMotion(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-teal-300 text-teal-600 accent-teal-500 "
            />{" "}
            <span>
              Kurangi animasi (sarana aksesibilitas; komponen lain dapat membaca
              ini nanti).
            </span>{" "}
          </label>{" "}
          <label className="flex cursor-pointer items-start gap-3 text-sm font-semibold text-gray-700 ">
            {" "}
            <input
              type="checkbox"
              checked={compactCards}
              onChange={(e) => setCompactCards(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-teal-300 text-teal-600 accent-teal-500 "
            />{" "}
            <span>
              Mode kartu ringkas di daftar jelajah (akan dipakai saat halaman
              tersebut mengonsumsi preferensi).
            </span>{" "}
          </label>{" "}
        </div>{" "}
        <div className="grid gap-5 sm:grid-cols-2">
          {" "}
          <div>
            {" "}
            <label className="text-sm font-semibold text-gray-700 ">
              Kata sandi baru
            </label>{" "}
            <input
              className={fieldClass}
              type="password"
              autoComplete="new-password"
              value={passwordNew}
              onChange={(e) => setPasswordNew(e.target.value)}
            />{" "}
          </div>{" "}
          <div>
            {" "}
            <label className="text-sm font-semibold text-gray-700 ">
              Konfirmasi
            </label>{" "}
            <input
              className={fieldClass}
              type="password"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />{" "}
          </div>{" "}
        </div>{" "}
      </SegmentCard>{" "}
      <SegmentCard
        eyebrow="Privasi akun"
        title="Visibilitas Profil"
        description="Atur apakah profilmu bisa dilihat oleh pengguna lain. Jika akun privat, konten (postingan, komunitas, acara yang kamu buat) hanya bisa dilihat oleh kamu sendiri."
        actions={
          <button
            type="button"
            disabled={savingPrivacy}
            onClick={async () => {
              if (!token) return;
              setSavingPrivacy(true); setErrPrivacy(null); setMsgPrivacy(null);
              try {
                await updateMyProfile(token, { is_private: !isPrivate } as Parameters<typeof updateMyProfile>[1]);
                setIsPrivate(!isPrivate);
                setMsgPrivacy(`Akun berhasil diubah ke ${!isPrivate ? "Privat 🔒" : "Publik 🔓"}`);
              } catch (e) {
                setErrPrivacy(e instanceof Error ? e.message : "Gagal menyimpan.");
              } finally { setSavingPrivacy(false); }
            }}
            className={`rounded-full px-5 py-2.5 text-sm font-bold shadow-sm transition ${
              isPrivate
                ? "bg-gray-700 text-white hover:bg-gray-800"
                : "bg-teal-500 text-white hover:brightness-105"
            } disabled:opacity-50`}
          >
            {savingPrivacy ? "Menyimpan…" : isPrivate ? "🔒 Ubah ke Publik" : "🔓 Ubah ke Privat"}
          </button>
        }
      >
        <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${isPrivate ? "bg-gray-100" : "bg-teal-50"}`}>
            {isPrivate ? "🔒" : "🔓"}
          </div>
          <div>
            <p className="font-extrabold text-gray-900">{isPrivate ? "Akun Privat" : "Akun Publik"}</p>
            <p className="mt-1 text-sm text-gray-600">
              {isPrivate
                ? "Profilmu tidak menampilkan konten kepada pengguna lain. Nama dan foto masih terlihat di pencarian."
                : "Siapa saja bisa melihat komunitas yang kamu buat, acara, dan postinganmu di profil publik."}
            </p>
          </div>
        </div>
        {msgPrivacy && <p className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800">{msgPrivacy}</p>}
        {errPrivacy && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{errPrivacy}</p>}
      </SegmentCard>{" "}
    </div>
  );
}

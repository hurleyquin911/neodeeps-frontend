"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getApiBase, registerRequest } from "@/lib/api";

const fieldClass =
  "mt-1.5 w-full rounded-2xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[15px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-200/50 disabled:opacity-55";

const sectionTitleClass = "text-xs font-bold uppercase tracking-[0.22em] text-teal-700";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [occupation, setOccupation] = useState("");
  const [education, setEducation] = useState("");
  const [language, setLanguage] = useState("id");

  const [religion, setReligion] = useState("");
  const [bio, setBio] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [favoriteMusic, setFavoriteMusic] = useState("");
  const [favoriteMovies, setFavoriteMovies] = useState("");
  const [favoriteFood, setFavoriteFood] = useState("");
  const [zodiac, setZodiac] = useState("");
  const [mbti, setMbti] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  let apiConfigured = true;
  try {
    getApiBase();
  } catch {
    apiConfigured = false;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const n = name.trim();
    const u = username.trim();
    const em = email.trim();

    const ph = phone.trim();
    const cit = city.trim();
    const addr = address.trim();
    const occ = occupation.trim();
    const edu = education.trim();
    const lang = language.trim();

    if (!n || !u || !em || !password) {
      setError("Data akun: nama, username, email, dan kata sandi wajib.");
      return;
    }
    if (!ph || !birthDate || !gender || !cit || !addr || !occ || !edu || !lang) {
      setError("Profil: nomor HP, tanggal lahir, gender, kota, alamat, pekerjaan, pendidikan, dan bahasa wajib diisi.");
      return;
    }
    if (u.length < 3) {
      setError("Username minimal 3 karakter.");
      return;
    }
    if (password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      await registerRequest({
        name: n,
        username: u,
        email: em,
        password,
        phone: ph,
        birth_date: birthDate,
        gender,
        city: cit,
        address: addr,
        occupation: occ,
        education: edu,
        language: lang,
        religion: religion.trim() || undefined,
        bio: bio.trim() || undefined,
        hobbies: hobbies.trim() || undefined,
        favorite_music: favoriteMusic.trim() || undefined,
        favorite_movies: favoriteMovies.trim() || undefined,
        favorite_food: favoriteFood.trim() || undefined,
        zodiac: zodiac.trim() || undefined,
        mbti: mbti.trim() || undefined,
      });
      router.push("/login?registered=1");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pendaftaran gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-8">
      {!apiConfigured && (
        <p className="rounded-2xl border border-amber-200/75 bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-950">
          Layanan tidak tersedia sementara. Mohon tunggu sebentar lalu coba lagi.
        </p>
      )}

      <fieldset className="space-y-4 border-0 p-0">
        <legend className={sectionTitleClass}>Data akun</legend>

        <div>
          <label htmlFor="reg-name" className="text-sm font-semibold text-gray-700">
            Nama lengkap
          </label>
          <input
            id="reg-name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className={fieldClass}
            required
          />
        </div>

        <div>
          <label htmlFor="reg-username" className="text-sm font-semibold text-gray-700">
            Nama pengguna
          </label>
          <input
            id="reg-username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            className={fieldClass}
            placeholder="contoh_neo"
            required
            minLength={3}
          />
        </div>

        <div>
          <label htmlFor="reg-email" className="text-sm font-semibold text-gray-700">
            Email
          </label>
          <input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className={fieldClass}
            placeholder="nama@email.com"
            required
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="reg-password" className="text-sm font-semibold text-gray-700">
              Kata sandi
            </label>
            <input
              id="reg-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className={fieldClass}
              required
              minLength={8}
            />
          </div>
          <div>
            <label htmlFor="reg-confirm" className="text-sm font-semibold text-gray-700">
              Konfirmasi
            </label>
            <input
              id="reg-confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
              className={fieldClass}
              required
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-0 p-0">
        <legend className={sectionTitleClass}>Profil wajib</legend>
        <p className="text-sm leading-relaxed text-gray-600">
          Informasi ini disimpan sesuai model pengguna pada server. Anda dapat mengeditnya lagi nanti di pengaturan (jika telah tersedia di aplikasi).
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="reg-phone" className="text-sm font-semibold text-gray-700">
              Nomor telepon
            </label>
            <input
              id="reg-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              className={fieldClass}
              required
            />
          </div>
          <div>
            <label htmlFor="reg-birth" className="text-sm font-semibold text-gray-700">
              Tanggal lahir
            </label>
            <input
              id="reg-birth"
              name="birth_date"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              disabled={loading}
              className={fieldClass}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-gender" className="text-sm font-semibold text-gray-700">
            Gender
          </label>
          <select
            id="reg-gender"
            name="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            disabled={loading}
            className={fieldClass}
            required
          >
            <option value="">Pilih...</option>
            <option value="male">Laki-laki</option>
            <option value="female">Perempuan</option>
            <option value="other">Lainnya</option>
            <option value="prefer_not_to_say">Prefer tidak menyebutkan</option>
          </select>
        </div>

        <div>
          <label htmlFor="reg-city" className="text-sm font-semibold text-gray-700">
            Kota
          </label>
          <input
            id="reg-city"
            name="city"
            type="text"
            autoComplete="address-level2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={loading}
            className={fieldClass}
            required
          />
        </div>

        <div>
          <label htmlFor="reg-address" className="text-sm font-semibold text-gray-700">
            Alamat
          </label>
          <textarea
            id="reg-address"
            name="address"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={loading}
            className={`${fieldClass} resize-y min-h-[5.5rem]`}
            required
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="reg-occupation" className="text-sm font-semibold text-gray-700">
              Pekerjaan
            </label>
            <input
              id="reg-occupation"
              name="occupation"
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              disabled={loading}
              className={fieldClass}
              required
            />
          </div>
          <div>
            <label htmlFor="reg-education" className="text-sm font-semibold text-gray-700">
              Pendidikan
            </label>
            <input
              id="reg-education"
              name="education"
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              disabled={loading}
              className={fieldClass}
              placeholder="mis. S1, SMA, pelajar"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-language" className="text-sm font-semibold text-gray-700">
            Bahasa utama
          </label>
          <input
            id="reg-language"
            name="language"
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={loading}
            className={fieldClass}
            placeholder="id, en, …"
            required
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-0 p-0">
        <legend className={sectionTitleClass}>Tambahan (opsional)</legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="reg-religion" className="text-sm font-semibold text-gray-700">
              Agama
            </label>
            <input
              id="reg-religion"
              name="religion"
              type="text"
              value={religion}
              onChange={(e) => setReligion(e.target.value)}
              disabled={loading}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="reg-zodiac" className="text-sm font-semibold text-gray-700">
              Zodiak
            </label>
            <input
              id="reg-zodiac"
              name="zodiac"
              type="text"
              value={zodiac}
              onChange={(e) => setZodiac(e.target.value)}
              disabled={loading}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-bio" className="text-sm font-semibold text-gray-700">
            Bio singkat
          </label>
          <textarea
            id="reg-bio"
            name="bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={loading}
            className={`${fieldClass} resize-y min-h-[5.5rem]`}
          />
        </div>

        <div>
          <label htmlFor="reg-hobbies" className="text-sm font-semibold text-gray-700">
            Hobi
          </label>
          <input
            id="reg-hobbies"
            name="hobbies"
            type="text"
            value={hobbies}
            onChange={(e) => setHobbies(e.target.value)}
            disabled={loading}
            className={fieldClass}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="reg-music" className="text-sm font-semibold text-gray-700">
              Musik favorit
            </label>
            <input
              id="reg-music"
              name="favorite_music"
              type="text"
              value={favoriteMusic}
              onChange={(e) => setFavoriteMusic(e.target.value)}
              disabled={loading}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="reg-movies" className="text-sm font-semibold text-gray-700">
              Film favorit
            </label>
            <input
              id="reg-movies"
              name="favorite_movies"
              type="text"
              value={favoriteMovies}
              onChange={(e) => setFavoriteMovies(e.target.value)}
              disabled={loading}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-food" className="text-sm font-semibold text-gray-700">
            Makanan favorit
          </label>
          <input
            id="reg-food"
            name="favorite_food"
            type="text"
            value={favoriteFood}
            onChange={(e) => setFavoriteFood(e.target.value)}
            disabled={loading}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="reg-mbti" className="text-sm font-semibold text-gray-700">
            MBTI
          </label>
          <input
            id="reg-mbti"
            name="mbti"
            type="text"
            value={mbti}
            onChange={(e) => setMbti(e.target.value)}
            disabled={loading}
            className={fieldClass}
            placeholder="mis. INFJ"
            maxLength={16}
          />
        </div>
      </fieldset>

      {error && (
        <p className="rounded-2xl border border-red-200/70 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-800" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !apiConfigured}
        className="flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-teal-600 text-sm font-bold text-white shadow-lg shadow-teal-400/30 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {loading ? "Membuat akun…" : "Gabung ke Neodeeps"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Sudah terdaftar?{" "}
        <Link href="/login" className="font-bold text-teal-700 underline-offset-4 hover:text-teal-500 hover:underline">
          Masuk
        </Link>
      </p>
      <p className="text-center">
        <Link href="/" className="text-sm font-semibold text-gray-500 transition hover:text-teal-700">
          ← Kembali ke beranda
        </Link>
      </p>
    </form>
  );
}

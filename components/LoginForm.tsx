"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { dashboardPathForRole } from "@/lib/dashboard-path";
import { getApiBase, loginRequest } from "@/lib/api";
import { setSession } from "@/lib/auth-storage";

function buildLoginPayload(identifier: string, password: string) {
  const id = identifier.trim();
  if (id.includes("@")) {
    return { email: id, password };
  }
  return { username: id, password };
}

const inputClass =
  "mt-1 w-full rounded-2xl border border-gray-200 bg-gray-50/60 px-3.5 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-200/50 disabled:opacity-55";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
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
    if (!identifier.trim() || !password) {
      setError("Email/username dan kata sandi wajib.");
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await loginRequest(buildLoginPayload(identifier, password));
      setSession(token, user);
      router.push(dashboardPathForRole(user.role));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
      {!apiConfigured && (
        <p className="rounded-2xl border border-amber-200/70 bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-900">
          Layanan backend belum dijangkau dari peramban ini. Coba lagi atau cek pengaturan API.
        </p>
      )}

      {justRegistered && (
        <p className="rounded-2xl border border-teal-200/70 bg-teal-50 px-3 py-2.5 text-sm font-medium text-teal-900">
          Pendaftaran berhasil 🎉 Silakan masuk dengan akun barumu.
        </p>
      )}

      <div>
        <label htmlFor="identifier" className="block text-sm font-semibold text-gray-700">
          Email atau nama pengguna
        </label>
        <input
          id="identifier"
          type="text"
          name="identifier"
          autoComplete="username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          disabled={loading}
          className={inputClass}
          placeholder="contoh@email.com atau nama_love"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
          Kata sandi
        </label>
        <input
          id="password"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          className={inputClass}
        />
      </div>

      {error && (
        <p className="rounded-2xl border border-red-200/70 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-800" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !apiConfigured}
        className="mt-1 flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-teal-600 text-sm font-bold text-white shadow-lg shadow-teal-400/30 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {loading ? "Yeay, lagi masuk…" : "Masuk"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Belum punya akun?{" "}
        <Link href="/register" className="font-bold text-teal-700 underline-offset-4 hover:underline">
          Daftar
        </Link>
      </p>
      <Link href="/" className="text-center text-sm font-semibold text-gray-400 underline-offset-2 hover:text-teal-600 hover:underline">
        ← Balik ke beranda
      </Link>
    </form>
  );
}

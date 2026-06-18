"use client";

import { useState } from "react";

export function AppNotifyForm() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mt-5 flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50 px-5 py-4">
        <span className="text-xl">✅</span>
        <div>
          <p className="text-sm font-bold text-teal-800">Email terdaftar!</p>
          <p className="text-xs text-teal-600">
            Kami akan menghubungi Anda saat aplikasi diluncurkan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Alamat email Anda"
        className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 shadow-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
        required
      />
      <button
        type="submit"
        className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white shadow transition hover:bg-teal-700"
      >
        Daftarkan
      </button>
    </form>
  );
}

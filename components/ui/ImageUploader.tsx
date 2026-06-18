"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";

type Props = {
  label: string;
  value: string;          // URL saat ini (dari state parent)
  onChange: (url: string) => void;
  hint?: string;
  shape?: "square" | "wide"; // square = avatar/logo, wide = banner
  className?: string;
};

export function ImageUploader({ label, value, onChange, hint, shape = "square", className = "" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = getStoredToken();
    if (!token) { setError("Belum login."); return; }

    // Preview lokal sementara
    const localPreview = URL.createObjectURL(file);
    onChange(localPreview);
    setUploading(true);
    setError(null);

    try {
      const url = await uploadImage(token, file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal.");
      onChange(""); // reset jika gagal
    } finally {
      setUploading(false);
      // Kosongkan input agar file yang sama bisa dipilih ulang
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const previewClass =
    shape === "wide"
      ? "h-32 w-full rounded-2xl object-cover"
      : "h-20 w-20 rounded-2xl object-cover";

  const placeholderClass =
    shape === "wide"
      ? "flex h-32 w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 hover:border-teal-300 hover:bg-teal-50/30 transition cursor-pointer"
      : "flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 hover:border-teal-300 hover:bg-teal-50/30 transition cursor-pointer";

  return (
    <div className={`space-y-2 ${className}`}>
      <span className="block text-sm font-semibold text-gray-700">{label}</span>

      {/* Area klik / preview */}
      <div className={shape === "wide" ? "w-full" : "inline-block"}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="block disabled:opacity-60"
          title="Klik untuk pilih gambar"
        >
          {value ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt={label} className={previewClass} />
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/30 opacity-0 hover:opacity-100 transition">
                <span className="text-xs font-bold text-white">Ganti</span>
              </div>
            </div>
          ) : (
            <div className={placeholderClass}>
              {uploading ? (
                <span className="text-xs font-semibold text-teal-600 animate-pulse">Mengunggah…</span>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="text-[11px] font-semibold">Pilih file</span>
                </div>
              )}
            </div>
          )}
        </button>
      </div>

      {/* Tombol hapus jika ada gambar */}
      {value && !uploading && (
        <button
          type="button"
          onClick={() => { onChange(""); if (inputRef.current) inputRef.current.value = ""; }}
          className="text-xs font-semibold text-red-500 hover:underline"
        >
          Hapus gambar
        </button>
      )}

      {/* Info / error */}
      {hint && !error && !uploading && (
        <p className="text-xs text-gray-400">{hint}</p>
      )}
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
      {uploading && <p className="text-xs text-teal-600 animate-pulse">Mengunggah gambar…</p>}

      {/* Input tersembunyi */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={handleFile}
      />
    </div>
  );
}

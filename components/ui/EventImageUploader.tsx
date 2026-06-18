"use client";

/**
 * EventImageUploader
 * ------------------
 * Upload cover + galeri foto untuk acara.
 * - Gambar pertama = cover utama (ditampilkan besar)
 * - Gambar 2-6    = galeri tambahan (ditampilkan sebagai grid kecil)
 * - Drag & drop didukung
 * - Preview langsung sebelum upload selesai (blob URL)
 */

import { useRef, useState, useCallback } from "react";
import { uploadImage } from "@/lib/api";
import { getStoredToken } from "@/lib/auth-storage";

const MAX_IMAGES = 6;

type Props = {
  coverUrl: string;
  galleryUrls: string[];
  onCoverChange: (url: string) => void;
  onGalleryChange: (urls: string[]) => void;
};

export function EventImageUploader({ coverUrl, galleryUrls, onCoverChange, onGalleryChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // 0–100
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const allImages = [coverUrl, ...galleryUrls].filter(Boolean);
  const canAddMore = allImages.length < MAX_IMAGES;

  async function processFiles(files: File[]) {
    if (!files.length) return;
    const token = getStoredToken();
    if (!token) { setError("Belum login."); return; }

    // Batasi total
    const slot = MAX_IMAGES - allImages.length;
    const toUpload = files.slice(0, slot);
    if (!toUpload.length) { setError(`Maksimal ${MAX_IMAGES} gambar.`); return; }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    // Preview lokal dulu (blob URL)
    const previews = toUpload.map((f) => URL.createObjectURL(f));
    if (!coverUrl) {
      onCoverChange(previews[0]);
      onGalleryChange([...galleryUrls, ...previews.slice(1)]);
    } else {
      onGalleryChange([...galleryUrls, ...previews]);
    }

    try {
      const urls: string[] = [];
      for (let i = 0; i < toUpload.length; i++) {
        const url = await uploadImage(token, toUpload[i]);
        urls.push(url);
        setUploadProgress(Math.round(((i + 1) / toUpload.length) * 100));
      }

      // Ganti blob URL dengan URL asli
      if (!coverUrl || coverUrl.startsWith("blob:")) {
        onCoverChange(urls[0]);
        onGalleryChange([
          ...galleryUrls.filter((u) => !u.startsWith("blob:")),
          ...urls.slice(1),
        ]);
      } else {
        onGalleryChange([
          ...galleryUrls.filter((u) => !u.startsWith("blob:")),
          ...urls,
        ]);
      }

      // Bersihkan blob URLs
      previews.forEach((p) => URL.revokeObjectURL(p));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal.");
      // Rollback previews
      if (coverUrl.startsWith("blob:")) onCoverChange("");
      onGalleryChange(galleryUrls.filter((u) => !u.startsWith("blob:")));
      previews.forEach((p) => URL.revokeObjectURL(p));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    void processFiles(files);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    void processFiles(files);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverUrl, galleryUrls]);

  function removeImage(idx: number) {
    const updated = allImages.filter((_, i) => i !== idx);
    onCoverChange(updated[0] ?? "");
    onGalleryChange(updated.slice(1));
  }

  function setCover(idx: number) {
    if (idx === 0) return;
    const reordered = [
      allImages[idx],
      ...allImages.filter((_, i) => i !== idx),
    ];
    onCoverChange(reordered[0]);
    onGalleryChange(reordered.slice(1));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="block text-sm font-semibold text-gray-700">
          Foto Acara
          <span className="ml-1.5 text-xs font-normal text-gray-400">
            (cover + galeri, maks {MAX_IMAGES} foto)
          </span>
        </span>
        {allImages.length > 0 && canAddMore && !uploading && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-[11px] font-bold text-teal-600 hover:bg-teal-100 transition"
          >
            + Tambah foto
          </button>
        )}
      </div>

      {/* Area upload utama */}
      {!coverUrl ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed transition-all cursor-pointer select-none
            ${dragging ? "border-teal-400 bg-teal-50 scale-[1.01]" : "border-gray-200 bg-gray-50 hover:border-teal-300 hover:bg-teal-50/40"}
            ${uploading ? "pointer-events-none" : ""}
          `}
          style={{ minHeight: 200 }}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="relative h-14 w-14">
                <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                  <circle
                    cx="28" cy="28" r="24" fill="none"
                    stroke="#14b8a6" strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    strokeDashoffset={`${2 * Math.PI * 24 * (1 - uploadProgress / 100)}`}
                    className="transition-all"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-teal-600">
                  {uploadProgress}%
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-600">Mengunggah foto…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg shadow-teal-200">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3 4.5h18M9.75 6.75h.008v.008H9.75V6.75z" />
                </svg>
              </div>
              <div>
                <p className="font-extrabold text-gray-700">
                  {dragging ? "Lepaskan untuk upload" : "Klik atau seret foto ke sini"}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  JPG, PNG, WebP — maks 5 MB per foto, hingga {MAX_IMAGES} foto
                </p>
                <p className="mt-0.5 text-xs text-teal-500 font-semibold">
                  Foto pertama akan jadi cover utama acara
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Preview: cover besar + thumbnail galeri */
        <div className="space-y-2">
          {/* Cover utama */}
          <div className="group relative overflow-hidden rounded-3xl bg-gray-100" style={{ aspectRatio: "16/7" }}>
            <img
              src={coverUrl}
              alt="Cover acara"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Badge cover */}
            <span className="absolute top-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-extrabold text-white backdrop-blur-sm">
              📌 Cover Utama
            </span>

            {/* Actions */}
            <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {canAddMore && !uploading && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1.5 text-[11px] font-bold text-gray-700 shadow backdrop-blur-sm hover:bg-white transition"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Tambah
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(0)}
                className="flex items-center gap-1 rounded-full bg-red-500/90 px-2.5 py-1.5 text-[11px] font-bold text-white shadow backdrop-blur-sm hover:bg-red-600 transition"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Hapus
              </button>
            </div>

            {/* Upload progress overlay */}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <div className="relative h-12 w-12">
                    <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
                      <circle
                        cx="24" cy="24" r="20" fill="none"
                        stroke="white" strokeWidth="4"
                        strokeDasharray={`${2 * Math.PI * 20}`}
                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - uploadProgress / 100)}`}
                        className="transition-all"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-white">
                      {uploadProgress}%
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white">Mengunggah…</p>
                </div>
              </div>
            )}
          </div>

          {/* Galeri thumbnail grid */}
          {(galleryUrls.length > 0 || canAddMore) && (
            <div className="grid grid-cols-5 gap-2">
              {galleryUrls.map((url, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl bg-gray-100"
                  style={{ aspectRatio: "1" }}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => setCover(i + 1)}
                      className="rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-extrabold text-gray-700 hover:bg-white transition"
                    >
                      Jadikan Cover
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(i + 1)}
                      className="rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-extrabold text-white hover:bg-red-600 transition"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}

              {/* Slot tambah foto */}
              {canAddMore && !uploading && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-500 transition"
                  style={{ aspectRatio: "1" }}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="text-[9px] font-bold">Foto</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="flex items-center gap-1.5 rounded-2xl bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          {error}
        </p>
      )}

      {/* Info hint */}
      {allImages.length === 0 && !uploading && (
        <p className="text-[11px] text-gray-400">
          Foto cover yang menarik meningkatkan kemungkinan orang bergabung ke acaramu. ✨
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="sr-only"
        onChange={handleFileInput}
      />
    </div>
  );
}

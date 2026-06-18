"use client";

/**
 * LocationPicker — input alamat + geocoding Nominatim (OpenStreetMap) + preview peta.
 * Tidak memerlukan API key. Rate-limit: 1 req/detik (Nominatim policy).
 */

import { useCallback, useEffect, useRef, useState } from "react";

export type LocationValue = {
  address_line: string;
  address_line_2?: string;
  city: string;
  province: string;
  postal_code: string;
  country_code: string;
  latitude: number | null;
  longitude: number | null;
};

type Props = {
  value: LocationValue;
  onChange: (val: LocationValue) => void;
  /** Label warna aksen — "teal" untuk acara, "amber" untuk komunitas */
  accent?: "teal" | "amber";
  required?: boolean;
};

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country_code?: string;
  };
};

function buildQueryAddress(loc: LocationValue): string {
  return [loc.address_line, loc.city, loc.province, loc.country_code === "ID" ? "Indonesia" : loc.country_code]
    .filter(Boolean)
    .join(", ");
}

export function LocationPicker({ value, onChange, accent = "teal", required = false }: Props) {
  const [geocoding, setGeocoding] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showMap, setShowMap] = useState(!!(value.latitude && value.longitude));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const focusRing = accent === "teal"
    ? "focus:border-teal-400 focus:ring-4 focus:ring-teal-200/40"
    : "focus:border-amber-400 focus:ring-4 focus:ring-amber-100";

  const btn = accent === "teal"
    ? "bg-teal-500 hover:brightness-105 text-white"
    : "bg-amber-500 hover:brightness-105 text-white";

  const field = `mt-1.5 w-full rounded-2xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-[15px] text-gray-900 outline-none transition placeholder:text-gray-400 disabled:opacity-55 ${focusRing}`;

  function update(patch: Partial<LocationValue>) {
    onChange({ ...value, ...patch });
  }

  /* Geocode from query string */
  async function geocode(query: string): Promise<NominatimResult[]> {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1&accept-language=id`;
    const res = await fetch(url, {
      headers: { "User-Agent": "FindCommunity/1.0 (neodeeps.com)" },
    });
    if (!res.ok) throw new Error(`Nominatim error ${res.status}`);
    return res.json() as Promise<NominatimResult[]>;
  }

  async function handleSearch() {
    const q = buildQueryAddress(value).trim();
    if (!q) { setGeoError("Isi setidaknya alamat atau kota untuk dicari."); return; }
    setGeocoding(true); setGeoError(null); setSuggestions([]);
    try {
      const results = await geocode(q);
      if (results.length === 0) {
        setGeoError("Lokasi tidak ditemukan. Coba perjelas alamat.");
        return;
      }
      if (results.length === 1) {
        applySuggestion(results[0]);
      } else {
        setSuggestions(results);
      }
    } catch {
      setGeoError("Gagal menghubungi layanan peta. Coba lagi.");
    } finally {
      setGeocoding(false);
    }
  }

  function applySuggestion(r: NominatimResult) {
    const lat = parseFloat(r.lat);
    const lon = parseFloat(r.lon);
    update({
      latitude: lat,
      longitude: lon,
      city: value.city || r.address?.city || r.address?.town || r.address?.village || "",
      province: value.province || r.address?.state || "",
      postal_code: value.postal_code || r.address?.postcode || "",
      country_code: value.country_code || (r.address?.country_code?.toUpperCase() ?? "ID"),
    });
    setSuggestions([]);
    setShowMap(true);
    setGeoError(null);
  }

  const mapSrc = value.latitude && value.longitude
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${value.longitude - 0.015},${value.latitude - 0.010},${value.longitude + 0.015},${value.latitude + 0.010}&layer=mapnik&marker=${value.latitude},${value.longitude}`
    : null;

  const osmLink = value.latitude && value.longitude
    ? `https://www.openstreetmap.org/?mlat=${value.latitude}&mlon=${value.longitude}#map=16/${value.latitude}/${value.longitude}`
    : null;

  return (
    <div className="space-y-4">
      {/* Alamat line 1 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700">
          Alamat{required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        <input
          className={field}
          value={value.address_line}
          onChange={(e) => update({ address_line: e.target.value })}
          placeholder="Jl. Sudirman No. 10, RT 01/RW 02"
        />
      </div>

      {/* Alamat line 2 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700">Alamat tambahan (opsional)</label>
        <input
          className={field}
          value={value.address_line_2 ?? ""}
          onChange={(e) => update({ address_line_2: e.target.value })}
          placeholder="Gedung lantai 3, blok B"
        />
      </div>

      {/* Kota + Provinsi */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-gray-700">
            Kota / Kabupaten{required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
          <input
            className={field}
            value={value.city}
            onChange={(e) => update({ city: e.target.value })}
            placeholder="Bandung"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Provinsi</label>
          <input
            className={field}
            value={value.province}
            onChange={(e) => update({ province: e.target.value })}
            placeholder="Jawa Barat"
          />
        </div>
      </div>

      {/* Kode pos + Negara */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-semibold text-gray-700">Kode pos</label>
          <input
            className={field}
            value={value.postal_code}
            onChange={(e) => update({ postal_code: e.target.value })}
            placeholder="40111"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Negara</label>
          <select
            className={field}
            value={value.country_code}
            onChange={(e) => update({ country_code: e.target.value })}
          >
            <option value="ID">🇮🇩 Indonesia</option>
            <option value="MY">🇲🇾 Malaysia</option>
            <option value="SG">🇸🇬 Singapura</option>
            <option value="US">🇺🇸 Amerika Serikat</option>
            <option value="AU">🇦🇺 Australia</option>
            <option value="GB">🇬🇧 Inggris</option>
            <option value="Other">Lainnya</option>
          </select>
        </div>
      </div>

      {/* Tombol geocode */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSearch}
          disabled={geocoding}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold shadow-sm transition disabled:opacity-50 ${btn}`}
        >
          {geocoding ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <span>🗺️</span>
          )}
          {geocoding ? "Mencari…" : "Temukan di Peta"}
        </button>

        {value.latitude && value.longitude && (
          <p className="text-xs text-gray-500 font-semibold">
            ✓ Koordinat: {Number(value.latitude).toFixed(5)}, {Number(value.longitude).toFixed(5)}
          </p>
        )}
      </div>

      {/* Error geocoding */}
      {geoError && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">
          {geoError}
        </p>
      )}

      {/* Daftar saran jika ada banyak hasil */}
      {suggestions.length > 1 && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-md overflow-hidden">
          <p className="border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-500">
            Pilih lokasi yang tepat
          </p>
          <ul className="divide-y divide-gray-50">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => applySuggestion(s)}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-900 transition"
                >
                  <span className="mr-2">📍</span>
                  {s.display_name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Map preview */}
      {showMap && mapSrc && (
        <div className="space-y-2">
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <iframe
              src={mapSrc}
              title="Peta lokasi"
              width="100%"
              height="260"
              style={{ border: 0 }}
              loading="lazy"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Peta dari <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a>
            </p>
            {osmLink && (
              <a
                href={osmLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-teal-600 hover:underline"
              >
                Buka peta penuh →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Manual lat/lng override */}
      <details className="rounded-2xl border border-gray-100 bg-gray-50/40 p-4">
        <summary className="cursor-pointer text-xs font-bold text-gray-500 select-none">
          📐 Masukkan koordinat manual
        </summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-gray-600">Latitude</label>
            <input
              type="number" step="0.0000001"
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
              value={value.latitude ?? ""}
              onChange={(e) => {
                const v = e.target.value ? parseFloat(e.target.value) : null;
                update({ latitude: v });
                if (v && value.longitude) setShowMap(true);
              }}
              placeholder="-6.9147"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600">Longitude</label>
            <input
              type="number" step="0.0000001"
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-400"
              value={value.longitude ?? ""}
              onChange={(e) => {
                const v = e.target.value ? parseFloat(e.target.value) : null;
                update({ longitude: v });
                if (value.latitude && v) setShowMap(true);
              }}
              placeholder="107.6098"
            />
          </div>
        </div>
      </details>
    </div>
  );
}

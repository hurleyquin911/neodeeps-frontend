"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/tentang", label: "Tentang" },
  { href: "/tutorial", label: "Tutorial" },
  { href: "/kontak", label: "Kontak" },
  { href: "/privasi", label: "Privasi" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
        isActive
          ? "bg-teal-50 text-teal-800"
          : "text-gray-600 hover:bg-teal-50 hover:text-teal-800"
      }`}
    >
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-teal-100/80 bg-[var(--neo-surface)]/92 shadow-[0_1px_24px_-8px_var(--brand-primary-glow)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-gray-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-[var(--brand-primary-dark)] text-[13px] font-black text-white shadow-md shadow-teal-400/40">
            n
          </span>
          Neodeeps
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Utama">
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
          <Link
            href="/login"
            className="rounded-full px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-teal-50 hover:text-teal-800"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-400/30 transition hover:brightness-105"
          >
            Daftar
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 md:hidden"
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav
          className="border-t border-teal-100/80 bg-[var(--neo-surface)] px-4 py-4 md:hidden"
          aria-label="Menu mobile"
        >
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-teal-50 hover:text-teal-800"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="border-t border-gray-100 pt-2">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-teal-50"
              >
                Masuk
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="block rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-3 text-center text-sm font-bold text-white"
              >
                Daftar
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

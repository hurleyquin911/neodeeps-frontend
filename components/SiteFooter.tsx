import Link from "next/link";

const footerLinks = {
  platform: [
    { href: "/tentang", label: "Tentang" },
    { href: "/tutorial", label: "Tutorial" },
    { href: "/kontak", label: "Kontak" },
  ],
  legal: [
    { href: "/privasi#privasi", label: "Kebijakan Privasi" },
    { href: "/privasi#ketentuan", label: "Ketentuan Penggunaan" },
  ],
  akun: [
    { href: "/register", label: "Bergabung" },
    { href: "/login", label: "Masuk" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-teal-100/80 bg-[var(--neo-bg-strong)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3 lg:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-teal-700 text-[11px] font-black text-white shadow-sm">
                n
              </span>
              <p className="text-lg font-extrabold text-gray-900">Neodeeps</p>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              Platform komunitas yang cerah, hangat, dan dibuat untuk koneksi yang terasa nyata — bukan kaku.
            </p>
            <a
              href="mailto:hello@neodeeps.id"
              className="inline-block text-sm font-semibold text-teal-600 transition hover:text-teal-700"
            >
              hello@neodeeps.id
            </a>
          </div>

          {/* Platform */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Platform</p>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm font-semibold text-gray-500 transition hover:text-teal-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Legal</p>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm font-semibold text-gray-500 transition hover:text-teal-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Akun */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Akun</p>
            <ul className="space-y-2">
              {footerLinks.akun.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm font-semibold text-gray-500 transition hover:text-teal-600">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-teal-100/60 bg-white py-4 text-center text-xs font-medium text-gray-400">
        © {new Date().getFullYear()} Neodeeps · Dibuat dengan vibe yang ramah ☀️
      </div>
    </footer>
  );
}

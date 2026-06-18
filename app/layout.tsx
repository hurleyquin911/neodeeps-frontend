import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

/** Tipografi utama: bersahabat, modern, cocok audiens muda — tetap ada mono untuk blok teknis bila dipakai. */
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Neodeeps-Temukan Komunitas & Event",
  description:
    "Platform untuk menemukan komunitas, acara, dan perkumpulan. Jelajahi tanpa akun; bergabung setelah masuk atau daftar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${jakarta.variable} ${geistMono.variable} h-full antialiased [color-scheme:light]`} style={{ background: "#FAFAFA" }}>
      <body className={`${jakarta.className} min-h-full flex flex-col bg-[var(--neo-bg)] text-[var(--neo-ink)]`}>
        {children}
      </body>
    </html>
  );
}

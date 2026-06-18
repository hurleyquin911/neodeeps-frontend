import { AdminOverviewClient } from "@/components/dashboard/admin/AdminOverviewClient";

export const metadata = { title: "Admin — Insight Platform" };

export default function AdminInsightsPage() {
  return (
    <div className="space-y-6">
      <header className="max-w-2xl space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Admin</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Insight Platform 📊
        </h1>
        <p className="text-base text-gray-600">
          Statistik real-time platform — pengguna, acara, komunitas, dan keanggotaan.
        </p>
      </header>
      <AdminOverviewClient />
    </div>
  );
}

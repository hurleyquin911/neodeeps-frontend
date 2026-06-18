/** Selaras dengan ENUM backend: superadmin | admin | user */
export type AppRole = "superadmin" | "admin" | "user";

export function dashboardPathForRole(role: string | undefined | null): string {
  const r = typeof role === "string" ? role.trim().toLowerCase() : "";
  if (r === "superadmin") return "/dashboard/superadmin";
  if (r === "admin") return "/dashboard/admin";
  return "/dashboard/user";
}

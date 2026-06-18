export type AuthUser = {
  id: number;
  uuid: string;
  name: string;
  username: string;
  email: string;
  role: string;
};

/** Profil lengkap dari `/auth/me` atau setelah login (tanpa password). */
export type UserMe = AuthUser & {
  email_verified_at?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  address?: string | null;
  city?: string | null;
  occupation?: string | null;
  education?: string | null;
  language?: string | null;
  religion?: string | null;
  bio?: string | null;
  hobbies?: string | null;
  favorite_music?: string | null;
  favorite_movies?: string | null;
  favorite_food?: string | null;
  zodiac?: string | null;
  mbti?: string | null;
  profile_photo_url?: string | null;
  profile_video_url?: string | null;
  profile_photos?: string[] | null;
  profile_banner_url?: string | null;
  interest_tags?: unknown;
  lifestyle?: unknown;
  personal_answers?: unknown;
  is_private?: boolean;
  event_quota?: number;
  community_quota?: number;
  created_at?: string;
  updated_at?: string;
};

/* ── Quota ── */
export type QuotaInfo = {
  event_quota: number;
  community_quota: number;
  used_events: number;
  used_communities: number;
  free_events: number;
  free_communities: number;
  price_per_pack: number;
  quota_per_pack: number;
};

export type QuotaPurchase = {
  uuid: string;
  events_quota_added: number;
  communities_quota_added: number;
  amount_idr: number;
  payment_status: "pending_payment" | "confirmed" | "cancelled";
  payment_proof_url?: string | null;
  valid_from?: string | null;
  valid_until?: string | null;
  confirmed_at?: string | null;
  notes?: string | null;
  created_at: string;
};

export type PaymentInfo = {
  amount_idr: number;
  bank: string;
  account_number: string;
  account_name: string;
  reference: string;
  note: string;
};

export function getApiBase(): string {
  const b = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!b) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL belum diset — contoh: http://127.0.0.1:5001/api/v1"
    );
  }
  return b.replace(/\/$/, "");
}

/** Normalisasi image_urls dari API (kadang string JSON, bukan array). */
export function normalizeImageUrls(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value.map((u) => (typeof u === "string" ? u.trim() : "")).filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[")) {
      try {
        return normalizeImageUrls(JSON.parse(trimmed));
      } catch {
        return [trimmed];
      }
    }
    return [trimmed];
  }
  return [];
}

/**
 * Upload satu file gambar ke backend.
 * Mengembalikan URL publik file yang bisa langsung dipakai sebagai src gambar.
 */
export async function uploadImage(token: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${getApiBase()}/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    url?: string;
    message?: string;
  };
  if (!res.ok || !data.ok || !data.url) {
    throw new Error(typeof data.message === "string" ? data.message : `Upload gagal (${res.status})`);
  }
  return data.url;
}

export async function loginRequest(payload: {
  email?: string;
  username?: string;
  password: string;
}): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch(`${getApiBase()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    token?: string;
    user?: AuthUser;
    message?: string;
  };
  if (!res.ok || !data.ok || !data.token || !data.user) {
    throw new Error(
      typeof data.message === "string" ? data.message : `Login gagal (${res.status})`
    );
  }
  return { token: data.token, user: data.user };
}

export type RegisterProfileFields = {
  phone: string;
  birth_date: string;
  gender: string;
  city: string;
  address: string;
  occupation: string;
  education: string;
  language: string;
  religion?: string;
  bio?: string;
  hobbies?: string;
  favorite_music?: string;
  favorite_movies?: string;
  favorite_food?: string;
  zodiac?: string;
  mbti?: string;
};

/** Pendaftaran publik → akun `user`; profil lengkap minimal wajib diisi bersama registrasi pertama (disinkron dengan backend).
 */
export async function registerRequest(
  body: {
    name: string;
    username: string;
    email: string;
    password: string;
  } & RegisterProfileFields
): Promise<AuthUser> {
  const payload: Record<string, unknown> = {
    name: body.name.trim(),
    username: body.username.trim(),
    email: body.email.trim().toLowerCase(),
    password: body.password,
    phone: body.phone.trim(),
    birth_date: body.birth_date.trim(),
    gender: body.gender.trim(),
    city: body.city.trim(),
    address: body.address.trim(),
    occupation: body.occupation.trim(),
    education: body.education.trim(),
    language: body.language.trim(),
  };
  const optionalStringKeys = [
    "religion",
    "bio",
    "hobbies",
    "favorite_music",
    "favorite_movies",
    "favorite_food",
    "zodiac",
    "mbti",
  ] as const;
  for (const k of optionalStringKeys) {
    const v = body[k];
    if (typeof v === "string" && v.trim() !== "") payload[k] = v.trim();
  }

  const res = await fetch(`${getApiBase()}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: AuthUser;
    message?: string;
  };
  if (!res.ok || !data.ok || !data.data) {
    throw new Error(
      typeof data.message === "string" ? data.message : `Pendaftaran gagal (${res.status})`
    );
  }
  return data.data;
}

export async function fetchMe(token: string): Promise<UserMe> {
  const res = await fetch(`${getApiBase()}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: UserMe;
    message?: string;
  };
  if (!res.ok || !data.ok || !data.data) {
    throw new Error(
      typeof data.message === "string" ? data.message : `Session tidak valid (${res.status})`
    );
  }
  return data.data;
}

export async function updateMyProfile(token: string, body: Record<string, unknown>): Promise<UserMe> {
  const res = await fetch(`${getApiBase()}/users/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: UserMe;
    message?: string;
  };
  if (!res.ok || !data.ok || !data.data) {
    throw new Error(
      typeof data.message === "string" ? data.message : `Gagal memperbarui profil (${res.status})`
    );
  }
  return data.data;
}

/* ─────────────────────────────────────────
   Event / Gathering types
   ───────────────────────────────────────── */
export type GatheringType =
  | "scheduled_event"
  | "meetup_gathering"
  | "chat_room"
  | "community_session"
  | "other";

export type EventStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "rejected"
  | "cancelled"
  | "completed";

export type EventItem = {
  id: number;
  uuid: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  summary?: string | null;
  description?: string | null;
  cover_image_url?: string | null;
  gathering_type: GatheringType;
  event_kind?: string | null;
  format: "physical" | "online" | "hybrid";
  status: EventStatus;
  visibility: "public" | "unlisted" | "private" | "invite_only";
  join_policy: "open" | "restricted";
  requires_host_approval?: boolean;
  starts_at: string;
  ends_at?: string | null;
  timezone: string;
  venue_name?: string | null;
  venue_city?: string | null;
  venue_address_line?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  online_meeting_url?: string | null;
  max_attendees?: number | null;
  waitlist_enabled?: boolean;
  rsvp_count_cache: number;
  is_free: boolean;
  price_amount?: string | null;
  price_currency?: string | null;
  tags?: string[] | null;
  primary_category?: string | null;
  gallery_urls?: string[] | null;
  house_rules?: string | null;
  what_to_bring?: string | null;
  moderation_submitted_at?: string | null;
  rejection_reason?: string | null;
  creator?: { uuid: string; name: string; email?: string; profile_photo_url?: string | null };
  created_at: string;
  updated_at: string;
};

export type MembershipStatus =
  | "pending"
  | "active"
  | "waitlist"
  | "withdrawn"
  | "removed_by_host";

export type MembershipItem = {
  id: number;
  event_id: number;
  user_id: number;
  status: MembershipStatus;
  guest_count: number;
  joined_at?: string | null;
  left_at?: string | null;
  membership_event?: EventItem;
  membership_user?: { uuid: string; name: string; username?: string; profile_photo_url?: string | null };
  created_at: string;
};

/** Ambil daftar peserta sebuah event (hanya host/admin yang dapat daftar lengkap). */
export async function fetchEventMembers(
  token: string,
  eventUuid: string,
  params?: { page?: number; limit?: number }
): Promise<{ data: MembershipItem[]; meta: PaginatedMeta }> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const res = await fetch(`${getApiBase()}/events/${eventUuid}/members?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: MembershipItem[]; meta?: PaginatedMeta; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? `Gagal memuat peserta (${res.status})`);
  return { data: data.data ?? [], meta: data.meta ?? { page: 1, limit: 30, total: 0 } };
}

/** Setujui / tolak / ubah status peserta (host only). */
export async function moderateEventMember(
  token: string,
  eventUuid: string,
  userUuid: string,
  status: MembershipStatus
): Promise<MembershipItem> {
  const res = await fetch(`${getApiBase()}/events/${eventUuid}/members/${userUuid}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: MembershipItem; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? `Gagal update peserta (${res.status})`);
  return data.data!;
}

export type PaginatedMeta = {
  page: number;
  limit: number;
  total: number;
};

/** Ambil event publik (tanpa auth). Filter: gathering_type, q (search), page, limit. */
export async function fetchPublicEvents(params?: {
  page?: number;
  limit?: number;
  gathering_type?: string;
  q?: string;
  category?: string;
  city?: string;
  lat?: number;
  lng?: number;
  radius_km?: number;
  token?: string | null;
}): Promise<{ data: (EventItem & { distance_km?: number })[]; meta: PaginatedMeta }> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.gathering_type) qs.set("gathering_type", params.gathering_type);
  if (params?.q) qs.set("q", params.q);
  if (params?.category) qs.set("category", params.category);
  if (params?.city) qs.set("city", params.city);
  if (params?.lat != null) qs.set("lat", String(params.lat));
  if (params?.lng != null) qs.set("lng", String(params.lng));
  if (params?.radius_km != null) qs.set("radius_km", String(params.radius_km));
  const url = `${getApiBase()}/events${qs.toString() ? `?${qs}` : ""}`;
  const headers: Record<string, string> = {};
  if (params?.token) headers.Authorization = `Bearer ${params.token}`;
  const res = await fetch(url, { cache: "no-store", headers });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: EventItem[];
    meta?: PaginatedMeta;
    message?: string;
  };
  if (!res.ok || !data.ok) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal memuat event (${res.status})`);
  }
  return { data: data.data ?? [], meta: data.meta ?? { page: 1, limit: 20, total: 0 } };
}

export type EventDetail = EventItem & {
  subtitle?: string | null;
  description?: string | null;
  venue_address_line?: string | null;
  venue_region?: string | null;
  venue_country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  hosting_community?: { uuid: string; name: string; avatar_url?: string | null } | null;
  creator?: { uuid: string; name: string; profile_photo_url?: string | null };
  my_membership?: {
    id?: number;
    status: MembershipStatus;
    guest_count: number;
    joined_at?: string | null;
  } | null;
};

/** Ambil detail satu event (opsional auth untuk my_membership). */
export async function fetchEventDetail(uuid: string, token?: string | null): Promise<EventDetail> {
  const res = await fetch(`${getApiBase()}/events/${uuid}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: EventDetail; message?: string };
  if (!res.ok || !data.ok || !data.data) throw new Error(data.message ?? `Event tidak ditemukan (${res.status})`);
  return data.data;
}

/** Update event milik sendiri */
export async function updateEvent(token: string, uuid: string, body: Record<string, unknown>): Promise<EventItem> {
  const res = await fetch(`${getApiBase()}/events/${uuid}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: EventItem; message?: string };
  if (!res.ok || !data.ok || !data.data) throw new Error(data.message ?? "Gagal update event");
  return data.data;
}

/** Hapus event milik sendiri */
export async function deleteEvent(token: string, uuid: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/events/${uuid}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? "Gagal hapus event");
}

/** Event yang dibuat oleh pengguna yang sedang login. */
export async function fetchMyCreatedEvents(
  token: string,
  params?: { page?: number; gathering_type?: string }
): Promise<{ data: EventItem[]; meta: PaginatedMeta }> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.gathering_type) qs.set("gathering_type", params.gathering_type);
  const url = `${getApiBase()}/users/me/events${qs.toString() ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: EventItem[];
    meta?: PaginatedMeta;
    message?: string;
  };
  if (!res.ok || !data.ok) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal memuat event saya (${res.status})`);
  }
  return { data: data.data ?? [], meta: data.meta ?? { page: 1, limit: 20, total: 0 } };
}

/** Membership (event yang diikuti) pengguna yang sedang login. */
export async function fetchMyMemberships(
  token: string,
  params?: { page?: number; gathering_type?: string; status?: string }
): Promise<{ data: MembershipItem[]; meta: PaginatedMeta }> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.gathering_type) qs.set("gathering_type", params.gathering_type);
  if (params?.status) qs.set("status", params.status);
  const url = `${getApiBase()}/users/me/memberships${qs.toString() ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: MembershipItem[];
    meta?: PaginatedMeta;
    message?: string;
  };
  if (!res.ok || !data.ok) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal memuat keanggotaan (${res.status})`);
  }
  return { data: data.data ?? [], meta: data.meta ?? { page: 1, limit: 20, total: 0 } };
}

/** Bergabung ke event/perkumpulan. */
export async function joinEvent(
  token: string,
  eventUuid: string,
  guest_count = 0
): Promise<MembershipItem> {
  const res = await fetch(`${getApiBase()}/events/${eventUuid}/join`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ guest_count }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: MembershipItem;
    message?: string;
  };
  if (!res.ok || !data.ok || !data.data) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal bergabung (${res.status})`);
  }
  return data.data;
}

/** Keluar dari event/perkumpulan. */
export async function leaveEvent(token: string, eventUuid: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/events/${eventUuid}/leave`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(typeof data.message === "string" ? data.message : `Gagal keluar (${res.status})`);
  }
}

/* ─────────────────────────────────────────
   Pesan langsung (DM antar user)
   ───────────────────────────────────────── */
export type DirectMessageUser = {
  uuid: string;
  name: string;
  username?: string;
  profile_photo_url?: string | null;
};

export type DirectConversationItem = {
  uuid: string;
  other_user: DirectMessageUser | null;
  last_message: {
    uuid: string;
    body: string;
    created_at: string;
    is_mine: boolean;
  } | null;
  unread: boolean;
  unread_count?: number;
  last_message_at: string | null;
  updated_at: string;
};

/** Jumlah pesan DM belum dibaca (ringan, untuk badge header). */
export async function fetchDirectMessageUnreadCount(token: string): Promise<number> {
  const res = await fetch(`${getApiBase()}/users/me/conversations/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: { count?: number };
    message?: string;
  };
  if (!res.ok || !data.ok) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal memuat jumlah pesan (${res.status})`);
  }
  return data.data?.count ?? 0;
}

export type DirectMessageItem = {
  id: number;
  uuid: string;
  body: string;
  attachments?: Array<{ type?: string; url: string; name?: string; mime?: string; size?: number }> | null;
  read_at?: string | null;
  created_at: string;
  sender?: DirectMessageUser | null;
};

/** Daftar percakapan DM saya. */
export async function fetchMyConversations(
  token: string,
  params?: { page?: number; limit?: number }
): Promise<{ data: DirectConversationItem[]; meta: { page: number; limit: number; total: number; unread_total: number } }> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const url = `${getApiBase()}/users/me/conversations${qs.toString() ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: DirectConversationItem[];
    meta?: { page: number; limit: number; total: number; unread_total: number };
    message?: string;
  };
  if (!res.ok || !data.ok) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal memuat percakapan (${res.status})`);
  }
  return {
    data: data.data ?? [],
    meta: data.meta ?? { page: 1, limit: 20, total: 0, unread_total: 0 },
  };
}

/** Buka atau buat percakapan DM dengan user lain. */
export async function openDirectConversation(
  token: string,
  userUuid: string
): Promise<{ uuid: string; other_user: DirectMessageUser | null }> {
  const res = await fetch(`${getApiBase()}/users/me/conversations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_uuid: userUuid }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: { uuid: string; other_user: DirectMessageUser | null };
    message?: string;
  };
  if (!res.ok || !data.ok || !data.data) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal membuka percakapan (${res.status})`);
  }
  return data.data;
}

/** Ambil pesan dalam percakapan DM. */
export async function fetchDirectMessages(
  token: string,
  conversationUuid: string,
  params?: { limit?: number; before_id?: number }
): Promise<{ data: DirectMessageItem[]; meta: { next_before_id: number | null; limit: number; other_user: DirectMessageUser | null } }> {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.before_id != null) qs.set("before_id", String(params.before_id));
  const url = `${getApiBase()}/users/me/conversations/${conversationUuid}/messages${qs.toString() ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: DirectMessageItem[];
    meta?: { next_before_id: number | null; limit: number; other_user: DirectMessageUser | null };
    message?: string;
  };
  if (!res.ok || !data.ok) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal memuat pesan (${res.status})`);
  }
  return {
    data: data.data ?? [],
    meta: data.meta ?? { next_before_id: null, limit: 40, other_user: null },
  };
}

/** Kirim pesan DM. */
export async function sendDirectMessage(
  token: string,
  conversationUuid: string,
  payload: { body?: string; attachments?: unknown }
): Promise<DirectMessageItem> {
  const res = await fetch(`${getApiBase()}/users/me/conversations/${conversationUuid}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: DirectMessageItem;
    message?: string;
  };
  if (!res.ok || !data.ok || !data.data) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal mengirim pesan (${res.status})`);
  }
  return data.data;
}

/* ─────────────────────────────────────────
   Diskusi komunitas (group chat)
   ───────────────────────────────────────── */
export type CommunityDiscussionMessageItem = {
  id: number;
  uuid: string;
  message_type: "text" | "image" | "system";
  body?: string | null;
  attachments?: Array<{ type?: string; url: string; name?: string; mime?: string; size?: number }> | null;
  created_at: string;
  sender?: DirectMessageUser | null;
};

export type CommunityChatPermissions = {
  mode?: "all_members" | "admins_only" | "disabled";
  allowed_roles?: string[];
};

/** Ambil pesan diskusi komunitas. */
export async function fetchCommunityDiscussion(
  token: string,
  communityUuid: string,
  params?: { limit?: number; before_id?: number }
): Promise<{ data: CommunityDiscussionMessageItem[]; meta: { next_before_id: number | null; limit: number; chat_permissions: CommunityChatPermissions } }> {
  const qs = new URLSearchParams();
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.before_id != null) qs.set("before_id", String(params.before_id));
  const url = `${getApiBase()}/communities/${communityUuid}/discussion${qs.toString() ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: CommunityDiscussionMessageItem[];
    meta?: { next_before_id: number | null; limit: number; chat_permissions: CommunityChatPermissions };
    message?: string;
  };
  if (!res.ok || !data.ok) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal memuat diskusi (${res.status})`);
  }
  return {
    data: data.data ?? [],
    meta: data.meta ?? { next_before_id: null, limit: 50, chat_permissions: { mode: "all_members" } },
  };
}

/** Kirim pesan diskusi komunitas. */
export async function postCommunityDiscussionMessage(
  token: string,
  communityUuid: string,
  payload: { body?: string; attachments?: unknown; message_type?: "text" | "image" }
): Promise<CommunityDiscussionMessageItem> {
  const res = await fetch(`${getApiBase()}/communities/${communityUuid}/discussion`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: CommunityDiscussionMessageItem;
    message?: string;
  };
  if (!res.ok || !data.ok || !data.data) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal mengirim pesan (${res.status})`);
  }
  return data.data;
}

export type CreateEventPayload = {
  title: string;
  subtitle?: string;
  summary?: string;
  description?: string;
  cover_image_url?: string;
  gallery_urls?: string[];
  gathering_type: GatheringType;
  event_kind?: string;
  format: "physical" | "online" | "hybrid";
  visibility: "public" | "unlisted" | "private";
  join_policy: "open" | "restricted";
  starts_at: string;
  ends_at?: string | null;
  timezone?: string;
  is_all_day?: boolean;
  venue_name?: string;
  venue_address_line?: string;
  venue_address_line_2?: string;
  venue_city?: string;
  venue_region?: string;
  venue_postal_code?: string;
  venue_country_code?: string;
  latitude?: number | null;
  longitude?: number | null;
  online_meeting_url?: string;
  max_attendees?: number | null;
  waitlist_enabled?: boolean;
  registration_required?: boolean;
  requires_host_approval?: boolean;
  allow_guest_count?: boolean;
  max_guests_per_attendee?: number | null;
  is_free?: boolean;
  price_amount?: number | null;
  price_currency?: string;
  external_ticketing_url?: string;
  primary_category?: string;
  tags?: string[];
  house_rules?: string;
  what_to_bring?: string;
  hosting_community_uuid?: string;
};

/** Buat event/perkumpulan baru (status: draft). */
export async function createEvent(token: string, payload: CreateEventPayload): Promise<EventItem> {
  const res = await fetch(`${getApiBase()}/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: EventItem;
    message?: string;
  };
  if (!res.ok || !data.ok || !data.data) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal membuat (${res.status})`);
  }
  return data.data;
}

/** Kirim event untuk review (draft → pending_review). */
export async function submitEventForReview(token: string, eventUuid: string): Promise<EventItem> {
  const res = await fetch(`${getApiBase()}/events/${eventUuid}/submit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: EventItem;
    message?: string;
  };
  if (!res.ok || !data.ok || !data.data) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal mengirim review (${res.status})`);
  }
  return data.data;
}

/* ════════════════════════════════════════════
   KOMUNITAS
   ════════════════════════════════════════════ */

export type CommunityStatus = "draft" | "pending_review" | "published" | "rejected";
export type CommunityVisibility = "public" | "unlisted" | "private";
export type CommunityJoinPolicy = "open" | "restricted";
export type CommunityMemberRole = "owner" | "admin" | "member";
export type CommunityMemberStatus = "active" | "pending" | "banned" | "left";

export type CommunityItem = {
  id: number;
  uuid: string;
  slug: string;
  name: string;
  subtitle?: string | null;
  description?: string | null;
  cover_image_url?: string | null;
  avatar_url?: string | null;
  primary_category?: string | null;
  tags?: string[] | null;
  status: CommunityStatus;
  visibility: CommunityVisibility;
  join_policy: CommunityJoinPolicy;
  requires_host_approval: boolean;
  member_count_cache: number;
  event_count_cache: number;
  // Lokasi
  address_line?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  creator_user_id: number;
  creator?: { uuid: string; name: string; email?: string } | null;
  moderation_submitted_at?: string | null;
  rejection_reason?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type CommunityMembershipItem = {
  id: number;
  community_id: number;
  user_id: number;
  role: CommunityMemberRole;
  status: CommunityMemberStatus;
  joined_at?: string | null;
  created_at: string;
  community?: CommunityItem | null;
};

export type CreateCommunityPayload = {
  name: string;
  subtitle?: string;
  description?: string;
  cover_image_url?: string;
  avatar_url?: string;
  primary_category?: string;
  tags?: string[];
  // Lokasi fisik
  address_line?: string;
  address_line_2?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country_code?: string;
  latitude?: number | null;
  longitude?: number | null;
  visibility?: CommunityVisibility;
  join_policy?: CommunityJoinPolicy;
  requires_host_approval?: boolean;
  organizer_display_name?: string;
  organizer_email?: string;
  organizer_website_url?: string;
  house_rules?: string;
};

/** List komunitas publik */
export async function fetchPublicCommunities(params?: {
  q?: string;
  category?: string;
  city?: string;
  province?: string;
  lat?: number;
  lng?: number;
  radius_km?: number;
  page?: number;
  limit?: number;
  token?: string | null;
}): Promise<{ data: (CommunityItem & { distance_km?: number })[]; meta: PaginatedMeta }> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.category) qs.set("category", params.category);
  if (params?.city) qs.set("city", params.city);
  if (params?.province) qs.set("province", params.province);
  if (params?.lat != null) qs.set("lat", String(params.lat));
  if (params?.lng != null) qs.set("lng", String(params.lng));
  if (params?.radius_km != null) qs.set("radius_km", String(params.radius_km));
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));

  const headers: Record<string, string> = {};
  if (params?.token) headers.Authorization = `Bearer ${params.token}`;
  const res = await fetch(`${getApiBase()}/communities?${qs.toString()}`, { headers });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: CommunityItem[];
    meta?: PaginatedMeta;
    message?: string;
  };
  if (!res.ok || !data.ok) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal memuat komunitas (${res.status})`);
  }
  return { data: data.data ?? [], meta: data.meta ?? { page: 1, limit: 20, total: 0 } };
}

/** Komunitas yang diikuti user login */
export async function fetchMyCommunityMemberships(
  token: string,
  params?: { status?: string; page?: number }
): Promise<{ data: CommunityMembershipItem[]; meta: PaginatedMeta }> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));

  const res = await fetch(`${getApiBase()}/users/me/communities?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: CommunityMembershipItem[];
    meta?: PaginatedMeta;
    message?: string;
  };
  if (!res.ok || !data.ok) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal memuat (${res.status})`);
  }
  return { data: data.data ?? [], meta: data.meta ?? { page: 1, limit: 20, total: 0 } };
}

/** Komunitas yang dibuat user login */
export async function fetchMyCreatedCommunities(
  token: string,
  params?: { status?: string; page?: number }
): Promise<{ data: CommunityItem[]; meta: PaginatedMeta }> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));

  const res = await fetch(`${getApiBase()}/users/me/communities/created?${qs.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: CommunityItem[];
    meta?: PaginatedMeta;
    message?: string;
  };
  if (!res.ok || !data.ok) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal memuat (${res.status})`);
  }
  return { data: data.data ?? [], meta: data.meta ?? { page: 1, limit: 20, total: 0 } };
}

/** Buat komunitas baru */
export async function createCommunity(token: string, payload: CreateCommunityPayload): Promise<CommunityItem> {
  const res = await fetch(`${getApiBase()}/communities`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: CommunityItem;
    message?: string;
  };
  if (!res.ok || !data.ok || !data.data) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal membuat komunitas (${res.status})`);
  }
  return data.data;
}

/** Kirim komunitas untuk review */
export async function submitCommunityForReview(token: string, communityUuid: string): Promise<CommunityItem> {
  const res = await fetch(`${getApiBase()}/communities/${communityUuid}/submit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: CommunityItem;
    message?: string;
  };
  if (!res.ok || !data.ok || !data.data) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal kirim review (${res.status})`);
  }
  return data.data;
}

/** Bergabung ke komunitas */
export async function joinCommunity(token: string, communityUuid: string): Promise<{ message: string }> {
  const res = await fetch(`${getApiBase()}/communities/${communityUuid}/join`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
  if (!res.ok || !data.ok) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal bergabung (${res.status})`);
  }
  return { message: data.message ?? "Berhasil bergabung!" };
}

/** Keluar dari komunitas */
export async function leaveCommunity(token: string, communityUuid: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/communities/${communityUuid}/leave`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(typeof data.message === "string" ? data.message : `Gagal keluar (${res.status})`);
  }
}

export type SuperadminOverviewDTO = {
  users_total: number;
  users_active_30d: number;
  users_regular_count: number;
  users_verified_count: number;
  admin_count: number;
  superadmin_count: number;
  moderation_pending_count: number;
  events_published_count: number;
  events_total: number;
  events_draft_count: number;
  events_rejected_count: number;
  event_memberships_total: number;
  chat_messages_total: number;
  chat_messages_last_30d: number;
  health: { database: string; api: boolean };
  recent_user_registrations: Array<{
    uuid: string;
    name: string;
    username: string;
    role: string;
    created_at: string;
  }>;
  pending_review_events: Array<{
    uuid: string;
    title: string;
    gathering_type: string;
    moderation_submitted_at: string | null;
    created_at: string;
  }>;
};

/* ════════════════════════════════════════════
   COMMUNITY FEED / BERANDA KOMUNITAS
   ════════════════════════════════════════════ */

export type PostType = "text" | "image" | "announcement" | "event_share";

export type CommunityPostAuthor = {
  uuid: string;
  name: string;
  username: string;
  profile_photo_url?: string | null;
};

export type CommunityPostItem = {
  id: number;
  uuid: string;
  community_id: number;
  author_user_id: number;
  content?: string | null;
  image_urls?: string[] | null;
  post_type: PostType;
  is_pinned: boolean;
  is_locked: boolean;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
  author?: CommunityPostAuthor | null;
  created_at: string;
  updated_at: string;
};

export type CommunityPostComment = {
  id: number;
  uuid: string;
  post_id: number;
  content: string;
  author?: CommunityPostAuthor | null;
  created_at: string;
};

export type CommunityProfileResponse = {
  data: CommunityItem;
  my_membership: {
    role: "owner" | "admin" | "member";
    status: string;
    joined_at: string | null;
  } | null;
};

/* ════════════════════════════════════════════
   PUBLIC USER PROFILE & SEARCH
   ════════════════════════════════════════════ */

export type PublicUserItem = {
  uuid: string;
  name: string;
  username: string;
  profile_photo_url?: string | null;
  profile_photos?: string[] | null;
  profile_banner_url?: string | null;
  bio?: string | null;
  city?: string | null;
  occupation?: string | null;
  hobbies?: string | null;
  interest_tags?: string[] | null;
  mbti?: string | null;
  zodiac?: string | null;
  is_private: boolean;
  created_at: string;
};

export type PublicProfileResponse = {
  data: PublicUserItem;
  is_private: boolean;
  content_visible: boolean;
  followers_count: number;
  following_count: number;
  my_follow_status: "none" | "active" | "pending" | "rejected" | null;
  communities: CommunityItem[];
  events: EventItem[];
  posts: (CommunityPostItem & { community?: { uuid: string; name: string; avatar_url?: string | null } | null })[];
};

export type FollowListItem = {
  uuid: string;
  followed_at?: string;
  requested_at?: string;
  user: PublicUserItem | null;
};

export type FollowStatus = "none" | "active" | "pending" | "rejected";

/** Ikuti pengguna (langsung untuk akun publik, permintaan untuk akun privat). */
export async function followUser(
  token: string,
  userUuid: string
): Promise<{ status: FollowStatus; message: string }> {
  const res = await fetch(`${getApiBase()}/users/${userUuid}/follow`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: { status: FollowStatus; message?: string };
    message?: string;
  };
  if (!res.ok || !data.ok || !data.data) {
    const msg =
      typeof data.message === "string"
        ? data.message
        : res.status === 404
          ? "Endpoint follow tidak ditemukan. Pastikan backend sudah di-restart setelah update."
          : `Gagal follow (${res.status})`;
    throw new Error(msg);
  }
  return { status: data.data.status, message: data.data.message ?? "" };
}

/** Berhenti mengikuti / batalkan permintaan follow. */
export async function unfollowUser(token: string, userUuid: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/users/${userUuid}/follow`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
  if (!res.ok || !data.ok) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal unfollow (${res.status})`);
  }
}

/** Permintaan follow masuk (untuk akun privat). */
export async function fetchFollowRequests(
  token: string,
  params?: { page?: number; limit?: number }
): Promise<{ data: FollowListItem[]; meta: PaginatedMeta }> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const url = `${getApiBase()}/users/me/follow-requests${qs.toString() ? `?${qs}` : ""}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: FollowListItem[];
    meta?: PaginatedMeta;
    message?: string;
  };
  if (!res.ok || !data.ok) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal memuat permintaan (${res.status})`);
  }
  return { data: data.data ?? [], meta: data.meta ?? { page: 1, limit: 20, total: 0 } };
}

/** Setujui atau tolak permintaan follow. */
export async function reviewFollowRequest(
  token: string,
  requestUuid: string,
  action: "approve" | "reject"
): Promise<void> {
  const res = await fetch(`${getApiBase()}/users/me/follow-requests/${requestUuid}/review`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action }),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
  if (!res.ok || !data.ok) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal memproses permintaan (${res.status})`);
  }
}

export async function fetchPublicProfile(uuid: string, token?: string | null): Promise<PublicProfileResponse> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBase()}/users/${uuid}/public-profile`, { headers });
  const data = (await res.json().catch(() => ({}))) as PublicProfileResponse & { ok?: boolean; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? `Profil tidak ditemukan (${res.status})`);
  return data;
}

export async function searchUsers(
  q: string,
  params?: { page?: number; limit?: number }
): Promise<{ data: PublicUserItem[]; meta: PaginatedMeta }> {
  const qs = new URLSearchParams({ q });
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const res = await fetch(`${getApiBase()}/users/search?${qs}`);
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: PublicUserItem[]; meta?: PaginatedMeta; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? "Gagal mencari pengguna");
  return { data: data.data ?? [], meta: data.meta ?? { page: 1, limit: 15, total: 0 } };
}

/* ════════════════════════════════════════════
   NOTIFICATIONS
   ════════════════════════════════════════════ */

export type NotificationItem = {
  uuid: string;
  type: string;
  title: string;
  body?: string | null;
  action_url?: string | null;
  image_url?: string | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  actor?: { uuid: string; name: string; profile_photo_url?: string | null } | null;
};

export async function fetchNotifications(
  token: string,
  params?: { page?: number; limit?: number; unread?: boolean }
): Promise<{ data: NotificationItem[]; meta: PaginatedMeta & { unread_count: number } }> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.unread) qs.set("unread", "true");
  const res = await fetch(`${getApiBase()}/notifications?${qs}`, {
    headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: NotificationItem[]; meta?: PaginatedMeta & { unread_count: number }; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? "Gagal memuat notifikasi");
  return { data: data.data ?? [], meta: data.meta ?? { page: 1, limit: 20, total: 0, unread_count: 0 } };
}

export async function fetchUnreadCount(token: string): Promise<number> {
  const res = await fetch(`${getApiBase()}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: { count: number } };
  return data.data?.count ?? 0;
}

export async function markNotificationRead(token: string, uuid: string): Promise<void> {
  await fetch(`${getApiBase()}/notifications/${uuid}/read`, {
    method: "PATCH", headers: { Authorization: `Bearer ${token}` },
  });
}

export async function markAllNotificationsRead(token: string): Promise<void> {
  await fetch(`${getApiBase()}/notifications/read-all`, {
    method: "PATCH", headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchMyGlobalFeed(
  token: string,
  params?: { page?: number; limit?: number }
): Promise<{ data: CommunityPostItem[]; meta: PaginatedMeta }> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const res = await fetch(`${getApiBase()}/users/me/feed?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: CommunityPostItem[]; meta?: PaginatedMeta; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? `Gagal memuat feed (${res.status})`);
  return { data: data.data ?? [], meta: data.meta ?? { page: 1, limit: 20, total: 0 } };
}

export async function fetchCommunityProfile(token: string | null, communityUuid: string): Promise<CommunityProfileResponse> {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBase()}/communities/${communityUuid}/profile`, { headers });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: CommunityItem; my_membership?: CommunityProfileResponse["my_membership"]; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? `Gagal memuat (${res.status})`);
  return { data: data.data!, my_membership: data.my_membership ?? null };
}

export async function fetchCommunityPosts(
  token: string | null,
  communityUuid: string,
  params?: { page?: number; limit?: number }
): Promise<{ data: CommunityPostItem[]; meta: PaginatedMeta }> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBase()}/communities/${communityUuid}/posts?${qs}`, { headers });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: CommunityPostItem[]; meta?: PaginatedMeta; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? `Gagal memuat (${res.status})`);
  return { data: data.data ?? [], meta: data.meta ?? { page: 1, limit: 15, total: 0 } };
}

export async function createCommunityPost(
  token: string,
  communityUuid: string,
  payload: { content?: string; image_urls?: string[]; post_type?: PostType }
): Promise<CommunityPostItem> {
  const res = await fetch(`${getApiBase()}/communities/${communityUuid}/posts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: CommunityPostItem; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? `Gagal posting (${res.status})`);
  return data.data!;
}

export async function deleteCommunityPost(token: string, communityUuid: string, postUuid: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/communities/${communityUuid}/posts/${postUuid}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? "Gagal hapus post");
}

export async function togglePinPost(token: string, communityUuid: string, postUuid: string): Promise<boolean> {
  const res = await fetch(`${getApiBase()}/communities/${communityUuid}/posts/${postUuid}/pin`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: { is_pinned: boolean }; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? "Gagal pin post");
  return data.data!.is_pinned;
}

export async function toggleLikePost(
  token: string,
  communityUuid: string,
  postUuid: string
): Promise<{ liked: boolean; likes_count: number }> {
  const res = await fetch(`${getApiBase()}/communities/${communityUuid}/posts/${postUuid}/like`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; liked?: boolean; likes_count?: number; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? "Gagal like");
  return { liked: data.liked!, likes_count: data.likes_count! };
}

export async function fetchPostComments(
  token: string | null,
  communityUuid: string,
  postUuid: string,
  params?: { page?: number }
): Promise<{ data: CommunityPostComment[]; meta: PaginatedMeta }> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${getApiBase()}/communities/${communityUuid}/posts/${postUuid}/comments?${qs}`, { headers });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: CommunityPostComment[]; meta?: PaginatedMeta; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? `Gagal memuat (${res.status})`);
  return { data: data.data ?? [], meta: data.meta ?? { page: 1, limit: 20, total: 0 } };
}

export async function createPostComment(
  token: string,
  communityUuid: string,
  postUuid: string,
  content: string
): Promise<CommunityPostComment> {
  const res = await fetch(`${getApiBase()}/communities/${communityUuid}/posts/${postUuid}/comments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: CommunityPostComment; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? "Gagal komentar");
  return data.data!;
}

export async function deletePostComment(
  token: string,
  communityUuid: string,
  postUuid: string,
  commentUuid: string
): Promise<void> {
  const res = await fetch(`${getApiBase()}/communities/${communityUuid}/posts/${postUuid}/comments/${commentUuid}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? "Gagal hapus komentar");
}

/* ════════════════════════════════════════════
   COMMUNITY MANAGEMENT (owner / admin komunitas)
   ════════════════════════════════════════════ */

export type CommunityMembershipRole = "owner" | "admin" | "member";
export type CommunityMembershipStatus = "active" | "pending" | "rejected" | "removed" | "banned" | "left";

export type CommunityMemberItem = {
  id: number;
  community_id: number;
  user_id: number;
  role: CommunityMembershipRole;
  status: CommunityMembershipStatus;
  joined_at?: string | null;
  ban_reason?: string | null;
  banned_at?: string | null;
  created_at: string;
  member_user?: {
    uuid: string;
    name: string;
    username: string;
    email: string;
    profile_photo_url?: string | null;
    city?: string | null;
  } | null;
};

export type AdminPermissions = {
  can_approve_members: boolean;
  can_remove_members: boolean;
  can_ban_members: boolean;
  can_edit_community: boolean;
  can_manage_events: boolean;
  can_promote_members: boolean;
};

export type MyRoleInCommunity = {
  role: CommunityMembershipRole | null;
  status?: CommunityMembershipStatus;
  joined_at?: string | null;
  permissions: AdminPermissions | null;
};

export async function fetchCommunityMembers(
  token: string,
  communityUuid: string,
  params?: { q?: string; role?: string; status?: string; page?: number; limit?: number }
): Promise<{ data: CommunityMemberItem[]; meta: PaginatedMeta }> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.role) qs.set("role", params.role);
  if (params?.status) qs.set("status", params.status ?? "active");
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const res = await fetch(`${getApiBase()}/communities/${communityUuid}/members?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: CommunityMemberItem[]; meta?: PaginatedMeta; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? `Gagal memuat (${res.status})`);
  return { data: data.data ?? [], meta: data.meta ?? { page: 1, limit: 30, total: 0 } };
}

export async function fetchMyRoleInCommunity(token: string, communityUuid: string): Promise<MyRoleInCommunity> {
  const res = await fetch(`${getApiBase()}/communities/${communityUuid}/my-role`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: MyRoleInCommunity; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? `Gagal memuat (${res.status})`);
  return data.data ?? { role: null, permissions: null };
}

export async function updateCommunityMemberRole(
  token: string,
  communityUuid: string,
  memberUuid: string,
  role: "admin" | "member"
): Promise<void> {
  const res = await fetch(`${getApiBase()}/communities/${communityUuid}/members/${memberUuid}/role`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? "Gagal update role");
}

export async function kickCommunityMember(token: string, communityUuid: string, memberUuid: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/communities/${communityUuid}/members/${memberUuid}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? "Gagal kick anggota");
}

export async function banCommunityMember(
  token: string,
  communityUuid: string,
  memberUuid: string,
  reason?: string
): Promise<void> {
  const res = await fetch(`${getApiBase()}/communities/${communityUuid}/members/${memberUuid}/ban`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? "Gagal ban anggota");
}

export async function unbanCommunityMember(token: string, communityUuid: string, memberUuid: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/communities/${communityUuid}/members/${memberUuid}/unban`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? "Gagal unban anggota");
}

export async function reviewJoinRequest(
  token: string,
  communityUuid: string,
  memberUuid: string,
  action: "approve" | "reject"
): Promise<void> {
  const res = await fetch(`${getApiBase()}/communities/${communityUuid}/members/${memberUuid}/review`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? "Gagal review permintaan");
}

export async function updateAdminPermissions(
  token: string,
  communityUuid: string,
  perms: Partial<AdminPermissions>
): Promise<AdminPermissions> {
  const res = await fetch(`${getApiBase()}/communities/${communityUuid}/admin-permissions`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(perms),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: { admin_permissions: AdminPermissions }; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? "Gagal update izin admin");
  return data.data!.admin_permissions;
}

export async function transferCommunityOwnership(
  token: string,
  communityUuid: string,
  targetMemberUuid: string
): Promise<void> {
  const res = await fetch(`${getApiBase()}/communities/${communityUuid}/transfer-ownership/${targetMemberUuid}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? "Gagal transfer ownership");
}

/* ════════════════════════════════════════════
   ADMIN
   ════════════════════════════════════════════ */

export type AdminUserItem = {
  id: number;
  uuid: string;
  name: string;
  username: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  city?: string | null;
  profile_photo_url?: string | null;
  created_at: string;
  email_verified_at?: string | null;
};

export type AdminUserDetail = AdminUserItem & {
  phone?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  bio?: string | null;
  stats: {
    created_events: number;
    created_communities: number;
    event_memberships: number;
  };
};

export type AdminOverviewData = {
  pending_events: number;
  pending_communities: number;
  total_pending: number;
  total_users: number;
  new_users_week: number;
  published_events: number;
  published_communities: number;
  total_memberships: number;
  recent_pending_events: Array<{
    uuid: string;
    title: string;
    gathering_type: string;
    format: string;
    moderation_submitted_at: string | null;
    created_at: string;
    creator?: { uuid: string; name: string; email: string } | null;
  }>;
  recent_pending_communities: Array<{
    uuid: string;
    name: string;
    primary_category: string | null;
    moderation_submitted_at: string | null;
    created_at: string;
    creator?: { uuid: string; name: string; email: string } | null;
  }>;
};

export async function fetchAdminOverview(token: string): Promise<AdminOverviewData> {
  const res = await fetch(`${getApiBase()}/admin/overview`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: AdminOverviewData; message?: string };
  if (!res.ok || !data.ok || !data.data) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal memuat (${res.status})`);
  }
  return data.data;
}

export async function fetchAdminPendingEvents(
  token: string,
  params?: { q?: string; status?: string; page?: number; limit?: number }
): Promise<{ data: EventItem[]; meta: PaginatedMeta }> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const res = await fetch(`${getApiBase()}/admin/moderation/events?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: EventItem[]; meta?: PaginatedMeta; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? `Gagal memuat (${res.status})`);
  return { data: data.data ?? [], meta: data.meta ?? { page: 1, limit: 20, total: 0 } };
}

export async function fetchAdminPendingCommunities(
  token: string,
  params?: { q?: string; status?: string; page?: number; limit?: number }
): Promise<{ data: CommunityItem[]; meta: PaginatedMeta }> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const res = await fetch(`${getApiBase()}/admin/moderation/communities?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: CommunityItem[]; meta?: PaginatedMeta; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? `Gagal memuat (${res.status})`);
  return { data: data.data ?? [], meta: data.meta ?? { page: 1, limit: 20, total: 0 } };
}

export async function moderateEvent(
  token: string,
  eventUuid: string,
  action: "approve" | "reject",
  options?: { rejection_reason?: string; moderation_notes?: string }
): Promise<EventItem> {
  const res = await fetch(`${getApiBase()}/admin/moderation/events/${eventUuid}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...options }),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: EventItem; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? `Gagal moderasi (${res.status})`);
  return data.data!;
}

export async function moderateCommunity(
  token: string,
  communityUuid: string,
  action: "approve" | "reject",
  options?: { rejection_reason?: string; moderation_notes?: string }
): Promise<CommunityItem> {
  const res = await fetch(`${getApiBase()}/admin/moderation/communities/${communityUuid}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...options }),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: CommunityItem; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? `Gagal moderasi (${res.status})`);
  return data.data!;
}

export async function fetchAdminUsers(
  token: string,
  params?: { q?: string; role?: string; page?: number; limit?: number }
): Promise<{ data: AdminUserItem[]; meta: PaginatedMeta }> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.role) qs.set("role", params.role);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const res = await fetch(`${getApiBase()}/admin/users?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: AdminUserItem[]; meta?: PaginatedMeta; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? `Gagal memuat (${res.status})`);
  return { data: data.data ?? [], meta: data.meta ?? { page: 1, limit: 20, total: 0 } };
}

export async function fetchAdminUserDetail(token: string, uuid: string): Promise<AdminUserDetail> {
  const res = await fetch(`${getApiBase()}/admin/users/${uuid}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: AdminUserDetail; message?: string };
  if (!res.ok || !data.ok || !data.data) throw new Error(data.message ?? `Gagal memuat (${res.status})`);
  return data.data;
}

export async function adminUpdateUserRole(token: string, uuid: string, role: "user" | "admin"): Promise<void> {
  const res = await fetch(`${getApiBase()}/admin/users/${uuid}/role`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
  if (!res.ok || !data.ok) throw new Error(data.message ?? `Gagal update role (${res.status})`);
}

export async function fetchSuperadminOverview(token: string): Promise<SuperadminOverviewDTO> {
  const res = await fetch(`${getApiBase()}/superadmin/overview`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: SuperadminOverviewDTO;
    message?: string;
  };
  if (!res.ok || !data.ok || !data.data) {
    throw new Error(typeof data.message === "string" ? data.message : `Gagal memuat ringkasan (${res.status})`);
  }
  return data.data;
}

/* ─────────────────────────────────────────
   QUOTA
───────────────────────────────────────── */

export async function fetchMyQuota(
  token: string
): Promise<{ data: QuotaInfo; purchases: QuotaPurchase[] }> {
  const res = await fetch(`${getApiBase()}/quota/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: QuotaInfo;
    purchases?: QuotaPurchase[];
    message?: string;
  };
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Gagal memuat kuota");
  return { data: json.data!, purchases: json.purchases ?? [] };
}

export async function requestQuotaPurchase(
  token: string,
  packs: number = 1
): Promise<{ data: QuotaPurchase; payment_info: PaymentInfo }> {
  const res = await fetch(`${getApiBase()}/quota/purchase`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ packs }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: QuotaPurchase;
    payment_info?: PaymentInfo;
    message?: string;
  };
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Gagal membuat pembelian");
  return { data: json.data!, payment_info: json.payment_info! };
}

export async function uploadPaymentProof(
  token: string,
  purchaseUuid: string,
  proofUrl: string
): Promise<QuotaPurchase> {
  const res = await fetch(`${getApiBase()}/quota/purchase/${purchaseUuid}/proof`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ proof_url: proofUrl }),
  });
  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: QuotaPurchase; message?: string };
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Gagal upload bukti");
  return json.data!;
}

export async function cancelQuotaPurchase(token: string, purchaseUuid: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/quota/purchase/${purchaseUuid}/cancel`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Gagal membatalkan");
}

export async function adminFetchPurchases(
  token: string,
  params?: { status?: string; page?: number; limit?: number }
): Promise<{ data: (QuotaPurchase & { buyer?: { uuid: string; name: string; email: string } })[]; meta: PaginatedMeta }> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const res = await fetch(`${getApiBase()}/quota/purchases?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: unknown[]; meta?: PaginatedMeta; message?: string };
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Gagal memuat daftar pembelian");
  return { data: (json.data ?? []) as (QuotaPurchase & { buyer?: { uuid: string; name: string; email: string } })[], meta: json.meta ?? { page: 1, limit: 20, total: 0 } };
}

export async function adminConfirmPurchase(
  token: string,
  purchaseUuid: string,
  notes?: string
): Promise<{ data: QuotaPurchase; message: string }> {
  const res = await fetch(`${getApiBase()}/quota/purchases/${purchaseUuid}/confirm`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });
  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; data?: QuotaPurchase; message?: string };
  if (!res.ok || !json.ok) throw new Error(json.message ?? "Gagal konfirmasi");
  return { data: json.data!, message: json.message ?? "Dikonfirmasi" };
}

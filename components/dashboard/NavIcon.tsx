import type { IconName } from "@/lib/dashboard-nav";

const common = "h-5 w-5 shrink-0 stroke-current";

/** Ikon stroked ringan tanpa dependency eksternal */
export function NavIcon({ name, className = "" }: { name: IconName; className?: string }) {
  const c = `${common} ${className}`;
  switch (name) {
    case "layout":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25z" />
        </svg>
      );
    case "compass":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.673a.337.337 0 010 .653l-5.603 2.098a.375.375 0 01-.491-.369l-.256-6.097a.375.375 0 01.627-.353l5.734 5.068z" />
        </svg>
      );
    case "users":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9 9 0 00-10.946-13.086M15 12a4 4 0 01-8 0M9.21 21.894a17.793 17.793 0 003.794 0" />
          <circle cx="17" cy="8" r="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "calendar":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 016.75 9h10.5a2.25 2.25 0 012.25 2.25v7.5" />
        </svg>
      );
    case "settings":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.986s.145.744.438.986l1.003.827c.42.347.597.93.261 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a9.798 9.798 0 01-.229.137c-.325.182-.583.489-.643.87l-.213 1.281c-.09.544-.563.943-1.11.943h-2.593c-.548 0-1.019-.397-1.11-.943l-.212-1.281c-.06-.385-.297-.694-.613-.867a10.065 10.065 0 01-.597-.387c-.316-.173-.694-.208-1.042-.086l-1.26.459a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.261-1.431l1.004-.837c.292-.246.438-.627.438-1.006 0-.38-.146-.761-.438-1.006l-1.004-.837a1.125 1.125 0 01-.261-1.431l1.297-2.247a1.125 1.125 0 011.37-.491l1.217.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.213-1.28z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case "clipboard":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.765 48.765 0 00-14.088 0A2.036 2.036 0 003.742 7.062v11.688A2.25 2.25 0 006 21h12a2.25 2.25 0 002.25-2.25V9.813a2.25 2.25 0 00-11.068-4.086" />
        </svg>
      );
    case "flag":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5m0 12h13l-3-9H4m13 13v-9M9 21h11" />
        </svg>
      );
    case "chart":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      );
    case "zap":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      );
    case "shield":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.295 9 11.622 5.176-1.328 9-6.03 9-11.623 0-1.042-.138-2.069-.394-3.068A12.026 12.026 0 0112 2.734z" />
        </svg>
      );
    case "userCog":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 21.008a9.007 9.007 0 0115 0v.048" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.983 17.986l1.078-.923a2.402 2.402 0 001.058-2.005v-.03a2.398 2.398 0 00-1.058-2.004l-.923-.924a2.394 2.394 0 00-3.086-.126l-.126.126a2.394 2.394 0 00-.126 3.086z" />
        </svg>
      );
    case "cpu":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v2.25M17.75 3v2.25M3 15.75V9a3 3 0 013-3h12a3 3 0 013 3v6.75M3 8.25h18M21 17.75v3M3 21h18M12 21v2.25M8.25 21h7.5" />
          <rect x="8.75" y="8.75" width="6.5" height="6.5" rx="1.25" />
        </svg>
      );
    case "sparkles":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.063 21.907l-.184-1.23a4.493 4.493 0 00-3.858-3.859l-1.23-.184 1.23-.183a4.493 4.493 0 003.859-3.858l.184 1.23-.184 1.23a4.493 4.493 0 003.858 3.858l1.23.184-1.23.183a4.493 4.493 0 00-3.859 3.859z" />
        </svg>
      );
    case "plus":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      );
    case "home":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.092 0l8.954 8.955M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      );
    case "userCircle":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
  }
}

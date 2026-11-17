// Business timezone; per-tenant later (spec §4).
export const TIME_ZONE = "America/Sao_Paulo";

const timeFmt = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

const dayFmt = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: TIME_ZONE,
});

const shortDateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
  timeZone: TIME_ZONE,
});

export const formatTime = (iso: string | number) =>
  timeFmt.format(new Date(iso));
export const formatShortDate = (iso: string) =>
  shortDateFmt.format(new Date(iso));

export function formatDay(date: Date) {
  const s = dayFmt.format(date);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function minutesAgo(iso: string, now: number) {
  const m = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000));
  if (m < 1) return "agora";
  if (m < 60) return `há ${m} min`;
  return `há ${Math.floor(m / 60)} h`;
}

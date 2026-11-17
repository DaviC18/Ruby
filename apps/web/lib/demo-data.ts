// Synthetic data for the panel until the API phases (2–7) exist.
// Times are generated relative to "now" so the call board always has a live state.

export type AppointmentStatus =
  | "confirmado"
  | "pendente"
  | "remarcado"
  | "cancelado"
  | "concluido";

export type Appointment = {
  id: string;
  client: string;
  service: string;
  modality: "presencial" | "online";
  start: string; // ISO (UTC)
  end: string; // ISO (UTC)
  status: AppointmentStatus;
  change?: string; // what changed, shown until the owner marks it seen
};

export type AttendantRequest = {
  id: string;
  client: string;
  phone: string;
  preview: string;
  at: string; // ISO
};

export type PlanUsage = {
  plan: "Free" | "Pro" | "Empresarial";
  used: number;
  limit: number;
  cycleEnds: string; // ISO
};

export type OnboardingStep = { label: string; done: boolean };

const MIN = 60_000;

function slot(base: number, offsetMin: number, durationMin: number) {
  const start = base + offsetMin * MIN;
  return {
    start: new Date(start).toISOString(),
    end: new Date(start + durationMin * MIN).toISOString(),
  };
}

// São Paulo has no DST since 2019: fixed UTC-3.
const SP_OFFSET_H = 3;

// Demo clock: the real time when it falls between 11:30 and 15:00 SP,
// otherwise today at 14:10 SP, so every slot stays within 09:00–19:00 of today.
export function demoNow(real = Date.now()) {
  const sp = new Date(real - SP_OFFSET_H * 60 * MIN);
  const minutes = sp.getUTCHours() * 60 + sp.getUTCMinutes();
  if (minutes >= 11 * 60 + 30 && minutes <= 15 * 60) return real;
  return Date.UTC(
    sp.getUTCFullYear(),
    sp.getUTCMonth(),
    sp.getUTCDate(),
    14 + SP_OFFSET_H,
    10,
  );
}

export function getDemoDay(now = demoNow()) {
  // Anchor on the quarter hour before now, so the current appointment started a few minutes ago.
  const base = Math.floor(now / (15 * MIN)) * (15 * MIN);

  const appointments: Appointment[] = [
    {
      id: "a1",
      client: "Marcos Vieira",
      service: "Corte + barba",
      modality: "presencial",
      ...slot(base, -150, 45),
      status: "concluido",
    },
    {
      id: "a2",
      client: "Paulo Henrique Saraiva",
      service: "Corte",
      modality: "presencial",
      ...slot(base, -90, 30),
      status: "concluido",
    },
    {
      id: "a3",
      client: "Rafael Antunes",
      service: "Barba",
      modality: "presencial",
      ...slot(base, -45, 30),
      status: "cancelado",
      change: "Cancelado pelo cliente no WhatsApp",
    },
    {
      id: "a4",
      client: "João Pedro Lima",
      service: "Corte + barba",
      modality: "presencial",
      ...slot(base, 0, 45),
      status: "confirmado",
    },
    {
      id: "a5",
      client: "Thiago Moura",
      service: "Corte",
      modality: "presencial",
      ...slot(base, 45, 30),
      status: "confirmado",
    },
    {
      id: "a6",
      client: "Gustavo Ferreira",
      service: "Consultoria de visual",
      modality: "online",
      ...slot(base, 90, 30),
      status: "remarcado",
      change: "Remarcado de amanhã 10:00 para hoje",
    },
    {
      id: "a7",
      client: "André Luiz Bastos",
      service: "Corte",
      modality: "presencial",
      ...slot(base, 135, 30),
      status: "pendente",
    },
    {
      id: "a8",
      client: "Felipe Nogueira",
      service: "Corte + barba",
      modality: "presencial",
      ...slot(base, 180, 45),
      status: "confirmado",
    },
  ];

  const attendantRequests: AttendantRequest[] = [
    {
      id: "c1",
      client: "Luciana Prado",
      phone: "+55 21 99812-4410",
      preview: "Vocês atendem criança de 6 anos?",
      at: new Date(now - 7 * MIN).toISOString(),
    },
    {
      id: "c2",
      client: "Eduardo Ramos",
      phone: "+55 21 98477-0932",
      preview: "Queria saber se dá pra pagar no Pix",
      at: new Date(now - 26 * MIN).toISOString(),
    },
  ];

  const usage: PlanUsage = {
    plan: "Pro",
    used: 184,
    limit: 300,
    cycleEnds: new Date(now + 12 * 24 * 60 * MIN).toISOString(),
  };

  const onboarding: OnboardingStep[] = [
    { label: "Dados do negócio", done: true },
    { label: "Horários e serviços", done: true },
    { label: "Conectar WhatsApp", done: true },
    { label: "Conectar Google Agenda", done: false },
    { label: "Revisar o menu do atendimento", done: false },
  ];

  return {
    businessName: "Barbearia do Zé",
    appointments,
    attendantRequests,
    usage,
    onboarding,
  };
}

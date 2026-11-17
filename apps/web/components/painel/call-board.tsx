"use client";

import { MapPin, Video } from "lucide-react";
import type { Appointment } from "@/lib/demo-data";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useNow } from "./use-now";

const live = (a: Appointment) => a.status !== "cancelado";

function Modality({ a, className }: { a: Appointment; className?: string }) {
  const Icon = a.modality === "online" ? Video : MapPin;
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Icon className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
      {a.modality === "online" ? "Online (Meet)" : "Presencial"}
    </span>
  );
}

export function CallBoard({
  appointments,
  initialNow,
}: {
  appointments: Appointment[];
  initialNow: number;
}) {
  const now = useNow(initialNow);
  const t = (iso: string) => new Date(iso).getTime();

  const upcoming = appointments
    .filter((a) => live(a) && t(a.end) > now)
    .sort((a, b) => t(a.start) - t(b.start));
  const current =
    upcoming[0] && t(upcoming[0].start) <= now ? upcoming[0] : undefined;
  const next = (current ? upcoming.slice(1) : upcoming).slice(0, 3);
  const minutesLeft = current
    ? Math.max(0, Math.ceil((t(current.end) - now) / 60_000))
    : 0;

  return (
    <section
      aria-labelledby="quadro-titulo"
      className="overflow-hidden rounded-xl border border-board-line bg-board text-board-foreground"
    >
      <h2 id="quadro-titulo" className="sr-only">
        Quadro de chamada
      </h2>
      <div className="grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* AGORA */}
        <div
          className="relative border-b border-board-line p-6 md:border-r md:border-b-0 md:p-8"
          aria-live="polite"
        >
          <h3 className="flex items-center gap-2 text-base font-medium text-board-foreground">
            <span
              aria-hidden="true"
              className={cn(
                "size-2 rounded-full",
                current
                  ? "animate-call-lamp bg-board-glow"
                  : "bg-board-muted/40",
              )}
              key={current?.id ?? "idle"}
            />
            Agora
          </h3>

          {current ? (
            <div key={current.id} className="animate-call-advance mt-4">
              <p className="font-mono text-6xl leading-none font-medium tracking-tight text-board-glow tabular-nums sm:text-7xl">
                {formatTime(current.start)}
              </p>
              <p className="mt-5 text-2xl font-semibold tracking-tight text-balance">
                {current.client}
              </p>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-board-muted">
                <span>{current.service}</span>
                <span aria-hidden="true">·</span>
                <Modality a={current} />
                <span aria-hidden="true">·</span>
                <span>
                  termina às{" "}
                  <span className="font-mono tabular-nums">
                    {formatTime(current.end)}
                  </span>{" "}
                  (<span className="font-mono tabular-nums">{minutesLeft}</span>{" "}
                  min)
                </span>
              </p>
            </div>
          ) : (
            <div className="animate-call-advance mt-4">
              <p className="font-mono text-6xl leading-none font-medium tracking-tight text-board-muted/50 tabular-nums sm:text-7xl">
                --:--
              </p>
              <p className="mt-5 text-lg text-board-muted">
                {next.length
                  ? "Nenhum atendimento em andamento."
                  : "A agenda de hoje terminou."}
              </p>
            </div>
          )}
        </div>

        {/* PRÓXIMOS */}
        <div className="p-6 md:p-8">
          <h3 className="text-base font-medium text-board-foreground">
            Próximos
          </h3>
          {next.length ? (
            <ol className="mt-3 divide-y divide-board-line">
              {next.map((a) => (
                <li
                  key={a.id}
                  className="animate-call-advance grid grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-4 py-3.5"
                >
                  <span className="font-mono text-2xl font-medium text-board-foreground tabular-nums">
                    {formatTime(a.start)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {a.client}
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-board-muted">
                      {a.service}
                      {a.modality === "online" && (
                        <>
                          <span aria-hidden="true">·</span>
                          <Modality a={a} />
                        </>
                      )}
                      {a.status === "pendente" && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-changed">
                            aguardando confirmação
                          </span>
                        </>
                      )}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-board-muted">
              Nenhum outro atendimento hoje.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

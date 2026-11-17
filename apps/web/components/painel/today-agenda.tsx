"use client";

import { Check, Clock, Eye, MapPin, Video, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Appointment, AppointmentStatus } from "@/lib/demo-data";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { WithMonoTimes } from "./times";
import { useNow } from "./use-now";

// Ruby is the only accent (the current row); amber is the only change signal.
const STATUS: Record<
  AppointmentStatus,
  { label: string; className: string; icon: typeof Check }
> = {
  confirmado: {
    label: "Confirmado",
    className: "text-foreground",
    icon: Check,
  },
  pendente: {
    label: "Aguardando",
    className: "text-changed-foreground",
    icon: Clock,
  },
  remarcado: {
    label: "Remarcado",
    className: "text-changed-foreground",
    icon: Clock,
  },
  cancelado: {
    label: "Cancelado",
    className: "text-muted-foreground",
    icon: X,
  },
  concluido: {
    label: "Concluído",
    className: "text-muted-foreground",
    icon: Check,
  },
};

export function TodayAgenda({
  appointments,
  initialNow,
  className,
}: {
  appointments: Appointment[];
  initialNow: number;
  className?: string;
}) {
  const now = useNow(initialNow);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const t = (iso: string) => new Date(iso).getTime();
  const sorted = [...appointments].sort((a, b) => t(a.start) - t(b.start));
  const changes = sorted.filter((a) => a.change && !seen.has(a.id)).length;

  return (
    <section aria-labelledby="agenda-titulo" className={className}>
      <header className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-foreground pb-3">
        <div>
          <h2
            id="agenda-titulo"
            className="text-lg font-semibold tracking-tight"
          >
            Agenda de hoje
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {sorted.filter((a) => a.status !== "cancelado").length} atendimentos
            {changes > 0 && (
              <>
                {" · "}
                <span className="font-medium text-changed-foreground">
                  {changes}{" "}
                  {changes === 1 ? "mudança não vista" : "mudanças não vistas"}
                </span>
              </>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          render={<Link href="/agendamentos" />}
          nativeButton={false}
        >
          Ver agendamentos
        </Button>
      </header>

      <ol>
        {sorted.map((a) => {
          const past = t(a.end) <= now;
          const isNow = !past && t(a.start) <= now && a.status !== "cancelado";
          const lit = a.change && !seen.has(a.id);
          const s =
            STATUS[past && a.status === "confirmado" ? "concluido" : a.status];
          const Mod = a.modality === "online" ? Video : MapPin;
          return (
            <li
              key={a.id}
              className={cn(
                "grid grid-cols-[4.25rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b px-2 py-3",
                lit && "bg-changed-surface",
                isNow && "bg-accent",
              )}
            >
              <span
                className={cn(
                  "flex items-center gap-2 font-mono text-base font-medium tabular-nums",
                  isNow
                    ? "text-primary"
                    : lit
                      ? "text-changed-foreground"
                      : past
                        ? "text-muted-foreground"
                        : "text-foreground",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    isNow
                      ? "animate-call-lamp bg-primary"
                      : lit
                        ? "animate-call-lamp bg-changed"
                        : "bg-transparent",
                  )}
                />
                <span
                  className={cn(
                    a.status === "cancelado" &&
                      "line-through decoration-muted-foreground/60",
                  )}
                >
                  {formatTime(a.start)}
                </span>
              </span>
              <span
                className={cn(
                  "min-w-0",
                  (past || a.status === "cancelado") && "text-muted-foreground",
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="truncate font-medium">{a.client}</span>
                  {isNow && (
                    <span className="shrink-0 rounded-sm bg-primary px-1.5 py-px text-xs font-semibold text-primary-foreground">
                      Agora
                    </span>
                  )}
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mod
                    className="size-3.5 shrink-0"
                    strokeWidth={1.75}
                    aria-label={
                      a.modality === "online" ? "Online" : "Presencial"
                    }
                  />
                  <span className="truncate">{a.service}</span>
                </span>
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 justify-self-end max-sm:col-start-2 max-sm:row-start-2 max-sm:justify-self-start text-sm font-medium",
                  s.className,
                )}
              >
                <s.icon
                  className="size-3.5"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                {s.label}
              </span>
              {a.change && lit && (
                <span className="col-span-full flex flex-wrap items-center justify-between gap-2 pl-[calc(4.25rem+1rem)] text-sm text-changed-foreground max-sm:pl-0">
                  <span>
                    <WithMonoTimes text={a.change} />
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSeen((prev) => new Set(prev).add(a.id))}
                    className="text-changed-foreground hover:bg-changed/15"
                  >
                    <Eye data-icon="inline-start" />
                    Marcar como visto
                  </Button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

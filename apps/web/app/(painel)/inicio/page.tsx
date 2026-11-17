import { Check, Headset } from "lucide-react";
import { io } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import { CallBoard } from "@/components/painel/call-board";
import { TodayAgenda } from "@/components/painel/today-agenda";
import { Button } from "@/components/ui/button";
import { demoNow, getDemoDay } from "@/lib/demo-data";
import { formatDay, formatShortDate, minutesAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function InicioPage() {
  return (
    <Suspense fallback={<InicioSkeleton />}>
      <Inicio />
    </Suspense>
  );
}

function InicioSkeleton() {
  return (
    <main
      aria-busy="true"
      className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8"
    >
      <div className="mb-6 h-9 w-72 animate-pulse rounded-md bg-muted" />
      <div className="h-72 rounded-xl bg-board" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="h-96 animate-pulse rounded-md bg-muted" />
        <div className="h-96 animate-pulse rounded-md bg-muted" />
      </div>
    </main>
  );
}

// Ruled section heading on the ground, continuing the call board's grammar.
const sectionHead =
  "flex items-baseline justify-between gap-3 border-b-2 border-foreground pb-3";

async function Inicio() {
  await io();
  const now = demoNow();
  const { businessName, appointments, attendantRequests, usage, onboarding } =
    getDemoDay(now);
  const pct = Math.round((usage.used / usage.limit) * 100);
  const done = onboarding.filter((s) => s.done).length;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {formatDay(new Date(now))}
        </h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="lg:hidden">{businessName}</span>
          <span className="rounded-md border border-dashed px-2.5 py-1 text-xs">
            Dados de exemplo
          </span>
        </div>
      </header>

      <CallBoard appointments={appointments} initialNow={now} />

      {/* Mobile order: what needs the owner first, then the agenda, then plan and setup. */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:grid-rows-[auto_auto_auto_1fr] lg:gap-x-10">
        <section
          aria-labelledby="precisa-titulo"
          className="lg:col-start-2 lg:row-start-1"
        >
          <h2 id="precisa-titulo" className={sectionHead}>
            <span className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              Precisa de você
              {attendantRequests.length > 0 && (
                <span className="rounded-full bg-primary px-1.5 font-mono text-xs leading-5 text-primary-foreground tabular-nums">
                  {attendantRequests.length}
                </span>
              )}
            </span>
          </h2>
          {attendantRequests.length ? (
            <ul className="divide-y border-b">
              {attendantRequests.map((r) => (
                <li key={r.id} className="py-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate font-medium">{r.client}</p>
                    <p className="shrink-0 text-xs text-muted-foreground">
                      <MonoAgo text={minutesAgo(r.at, now)} />
                    </p>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Headset
                      className="size-3.5 shrink-0"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    Pediu atendente
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm">“{r.preview}”</p>
                  <Button
                    size="lg"
                    className="mt-3 w-full"
                    render={<Link href={`/conversas?c=${r.id}`} />}
                    nativeButton={false}
                  >
                    Responder
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-sm text-muted-foreground">
              Nenhuma conversa esperando por você.
            </p>
          )}
        </section>

        <TodayAgenda
          appointments={appointments}
          initialNow={now}
          className="lg:col-start-1 lg:row-span-4 lg:row-start-1"
        />

        <section
          aria-labelledby="plano-titulo"
          className="lg:col-start-2 lg:row-start-2"
        >
          <div className={sectionHead}>
            <h2
              id="plano-titulo"
              className="text-lg font-semibold tracking-tight"
            >
              Plano {usage.plan}
            </h2>
            <Link
              href="/plano"
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver plano
            </Link>
          </div>
          <p className="mt-4 text-sm">
            <span className="font-mono text-lg font-medium tabular-nums">
              {usage.used}
            </span>
            <span className="text-muted-foreground">
              {" "}
              de <span className="font-mono tabular-nums">{usage.limit}</span>{" "}
              atendimentos
            </span>
          </p>
          {/* biome-ignore lint/a11y/useSemanticElements: native <meter> cannot carry the 80% notch styling */}
          <div
            role="meter"
            aria-label="Atendimentos usados no ciclo"
            aria-valuemin={0}
            aria-valuemax={usage.limit}
            aria-valuenow={usage.used}
            className="relative mt-2 h-2 overflow-hidden rounded-full bg-muted"
          >
            <div
              className={cn(
                "h-full rounded-full",
                pct >= 80 ? "bg-primary" : "bg-foreground/70",
              )}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-[80%] w-px bg-background"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Renova em {formatShortDate(usage.cycleEnds)} · aviso em 80% e 100%.
          </p>
        </section>

        {done < onboarding.length && (
          <section
            aria-labelledby="passos-titulo"
            className="lg:col-start-2 lg:row-start-3"
          >
            <div className={sectionHead}>
              <h2
                id="passos-titulo"
                className="text-lg font-semibold tracking-tight"
              >
                Primeiros passos
              </h2>
              <span className="text-sm text-muted-foreground">
                <span className="font-mono tabular-nums">{done}</span> de{" "}
                <span className="font-mono tabular-nums">
                  {onboarding.length}
                </span>
              </span>
            </div>
            <ol className="mt-4 space-y-2.5">
              {onboarding.map((s) => (
                <li key={s.label} className="flex items-center gap-3 text-sm">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-full border",
                      s.done
                        ? "border-transparent bg-foreground/80 text-background"
                        : "border-input",
                    )}
                  >
                    {s.done && <Check className="size-3" strokeWidth={2.5} />}
                  </span>
                  <span
                    className={cn(
                      s.done &&
                        "text-muted-foreground line-through decoration-muted-foreground/50",
                    )}
                  >
                    {s.label}
                    <span className="sr-only">
                      {s.done ? " (concluído)" : " (pendente)"}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            <Button
              variant="outline"
              size="lg"
              className="mt-4 w-full"
              render={<Link href="/integracoes" />}
              nativeButton={false}
            >
              Continuar: {onboarding.find((s) => !s.done)?.label}
            </Button>
          </section>
        )}
      </div>
    </main>
  );
}

function MonoAgo({ text }: { text: string }) {
  const [, prefix, n, unit] = text.match(/^(há )(\d+)( .+)$/) ?? [];
  if (!n) return text;
  return (
    <>
      {prefix}
      <span className="font-mono tabular-nums">{n}</span>
      {unit}
    </>
  );
}

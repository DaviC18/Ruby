import Link from "next/link";
import { Wordmark } from "@/components/painel/wordmark";

// The housing (warm-black) carries the brand and a sample call board;
// the form sits on the tinted ground, like every work area in the panel.
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:grid-rows-none">
      <aside className="flex flex-col bg-sidebar px-6 py-5 text-sidebar-foreground sm:px-10 lg:py-10">
        <Link href="/" aria-label="Ruby" className="self-start">
          <Wordmark />
        </Link>

        <div className="hidden flex-1 flex-col justify-center lg:flex">
          <p className="max-w-md text-3xl font-semibold tracking-tight text-balance">
            O Ruby atende, agenda e confirma pelo WhatsApp. Você entra quando
            precisam de você.
          </p>

          <figure className="mt-10 max-w-md rounded-xl border border-board-line bg-board p-6">
            <figcaption className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium">
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full bg-board-glow"
                />
                Agora
              </span>
              <span className="text-xs text-board-muted">Exemplo</span>
            </figcaption>
            <p className="mt-3 font-mono text-5xl leading-none font-medium tracking-tight text-board-glow tabular-nums">
              14:00
            </p>
            <p className="mt-4 text-lg font-semibold">João Pedro Lima</p>
            <p className="text-sm text-board-muted">
              Corte + barba · agendado pelo WhatsApp às{" "}
              <span className="font-mono tabular-nums">09:12</span>
            </p>
            <ol className="mt-5 divide-y divide-board-line border-t border-board-line text-sm">
              {[
                ["14:45", "Thiago Moura", "Confirmado"],
                ["15:30", "Gustavo Ferreira", "Remarcado"],
              ].map(([time, name, status]) => (
                <li key={time} className="flex items-baseline gap-4 py-2.5">
                  <span className="font-mono tabular-nums">{time}</span>
                  <span className="flex-1 truncate">{name}</span>
                  <span
                    className={
                      status === "Remarcado"
                        ? "text-changed"
                        : "text-board-muted"
                    }
                  >
                    {status}
                  </span>
                </li>
              ))}
            </ol>
          </figure>
        </div>
      </aside>

      <main className="flex items-start justify-center px-4 py-10 sm:px-6 lg:items-center lg:py-16">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}

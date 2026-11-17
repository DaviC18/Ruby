"use client";

import {
  CalendarDays,
  CreditCard,
  House,
  ListTree,
  LogOut,
  Menu,
  MessageCircle,
  Plug,
  Settings,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/inicio", label: "Início", icon: House },
  { href: "/conversas", label: "Conversas", icon: MessageCircle },
  { href: "/agendamentos", label: "Agendamentos", icon: CalendarDays },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/menu-automacoes", label: "Menu e automações", icon: ListTree },
  { href: "/integracoes", label: "Integrações", icon: Plug },
  { href: "/plano", label: "Plano e cobrança", icon: CreditCard },
  {
    href: "/configuracoes/horarios",
    label: "Configurações",
    icon: Settings,
    match: "/configuracoes",
  },
];

function Wordmark() {
  return (
    <span className="flex items-center gap-2.5 text-sidebar-foreground">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
        <path d="M6 3h12l4 6-10 12L2 9z" fill="var(--sidebar-primary)" />
        <path
          d="M2 9h20M8 3l4 6 4-6M12 9v12"
          stroke="oklch(0.19 0.012 20 / 0.45)"
          strokeWidth="1.2"
          fill="none"
        />
      </svg>
      <span className="text-lg font-semibold tracking-tight">Ruby</span>
    </span>
  );
}

export function Sidebar({
  businessName,
  attendantCount,
}: {
  businessName: string;
  attendantCount: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: close the drawer on navigation
  useEffect(() => setOpen(false), [pathname]);

  const nav = (
    <nav aria-label="Principal" className="flex flex-1 flex-col gap-0.5 px-3">
      {NAV.map(({ href, label, icon: Icon, match }) => {
        const active = pathname.startsWith(match ?? href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex h-10 items-center gap-3 rounded-md px-3 text-sm text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active &&
                "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute left-0 top-2.5 bottom-2.5 w-px rounded-full bg-transparent",
                active && "bg-sidebar-primary",
              )}
            />
            <Icon
              className={cn("size-4", active && "text-sidebar-primary")}
              strokeWidth={1.75}
            />
            <span className="flex-1">{label}</span>
            {href === "/conversas" && attendantCount > 0 && (
              <span className="min-w-5 rounded-full bg-sidebar-primary px-1.5 text-center font-mono text-xs leading-5 text-sidebar-primary-foreground tabular-nums">
                {attendantCount}
                <span className="sr-only"> pedidos de atendente</span>
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-sidebar-border px-3 py-3">
      <div className="flex items-center gap-3 px-3 py-2">
        <span
          aria-hidden="true"
          className="grid size-8 place-items-center rounded-md bg-sidebar-accent text-xs font-semibold text-sidebar-foreground"
        >
          {businessName
            .split(" ")
            .filter(
              (w) =>
                !["de", "da", "do", "das", "dos", "e"].includes(
                  w.toLowerCase(),
                ),
            )
            .slice(0, 2)
            .map((w) => w[0])
            .join("")}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-sidebar-foreground">
          {businessName}
        </span>
      </div>
      <button
        type="button"
        className="flex h-9 w-full items-center gap-3 rounded-md px-3 text-sm text-sidebar-muted transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <LogOut className="size-4" strokeWidth={1.75} />
        Sair
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col bg-sidebar lg:flex">
        <div className="flex h-16 items-center px-6">
          <Link href="/inicio" aria-label="Ruby, início">
            <Wordmark />
          </Link>
        </div>
        {nav}
        {footer}
      </aside>

      {/* Mobile bar + drawer */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-sidebar px-4 lg:hidden">
        <Link href="/inicio" aria-label="Ruby, início">
          <Wordmark />
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="menu-mobile"
          className="grid size-10 place-items-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
          <span className="sr-only">{open ? "Fechar menu" : "Abrir menu"}</span>
        </button>
      </header>
      {open && (
        <div
          id="menu-mobile"
          className="fixed inset-x-0 top-14 bottom-0 z-30 flex flex-col bg-sidebar pt-2 lg:hidden"
        >
          {nav}
          {footer}
        </div>
      )}
    </>
  );
}

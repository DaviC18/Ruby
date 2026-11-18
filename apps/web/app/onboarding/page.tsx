import type { Metadata } from "next";

export const metadata: Metadata = { title: "Primeiros passos · Ruby" };

// TODO(fase 1, task 9): the real onboarding (business, hours, services).
// Placeholder so the post-sign-up redirect lands on a real route.
export default function OnboardingPage() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Vamos configurar seu negócio
      </h1>
      <p className="mt-2 text-muted-foreground">
        Em breve você cadastra seus horários e serviços por aqui.
      </p>
    </main>
  );
}

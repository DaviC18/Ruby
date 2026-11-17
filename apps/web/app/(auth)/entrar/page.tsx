import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Entrar · Ruby" };

export default function EntrarPage() {
  return (
    <Suspense>
      <AuthForm mode="entrar" />
    </Suspense>
  );
}

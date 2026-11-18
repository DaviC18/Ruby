"use client";

import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useId, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

type Mode = "entrar" | "cadastro";

const email = z.email("Digite um e-mail válido.");

const schemas = {
  entrar: z.object({
    email,
    password: z.string().min(1, "Digite sua senha."),
  }),
  cadastro: z.object({
    name: z.string().trim().min(2, "Digite seu nome."),
    email,
    password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
  }),
};

type FieldErrors = Partial<Record<"name" | "email" | "password", string>>;

const NETWORK_ERROR =
  "Não foi possível conectar ao Ruby. Verifique sua internet e tente de novo.";
const GENERIC_ERROR = "Algo deu errado. Tente de novo em instantes.";
const GOOGLE_ERROR = "Não foi possível continuar com o Google. Tente de novo.";

// Better Auth answers in English; the owner only ever sees pt-BR.
// Unknown e-mail and wrong password share one message (no account probing).
function authErrorMessage(error: { status: number; code?: string }) {
  if (error.status === 401 || error.code === "INVALID_EMAIL_OR_PASSWORD") {
    return "E-mail ou senha incorretos.";
  }
  if (
    error.code === "USER_ALREADY_EXISTS" ||
    error.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
  ) {
    return "Já existe uma conta com este e-mail. Entre com ela.";
  }
  if (error.code === "PASSWORD_TOO_SHORT") {
    return "A senha precisa ter pelo menos 8 caracteres.";
  }
  if (error.status === 429) {
    return "Muitas tentativas seguidas. Aguarde um minuto e tente de novo.";
  }
  return error.status === 0 ? NETWORK_ERROR : GENERIC_ERROR;
}

// Only same-origin paths, so ?next= cannot redirect off-site. Defense in depth:
// 1. The raw value must be one "/" followed by a char other than "/" or "\",
//    with no ASCII control char (the URL parser strips tab/newline) and no
//    backslash anywhere (browsers read "\" as "/").
// 2. It must resolve on a fixed base's origin (catches "https:", "javascript:").
// 3. The normalized pathname must not start with "//" or "/\": dot-segment
//    removal turns "/..//host" into "//host", which is protocol-relative.
// A fixed base keeps this pure and render-safe; only path, query and hash are used.
const NEXT_BASE = "http://ruby.invalid";
// biome-ignore lint/suspicious/noControlCharactersInRegex: rejecting control chars is the point.
const UNSAFE_CHARS = /[\u0000-\u001F\u007F\\]/;

function safeNext(next: string | null) {
  if (!next || !/^\/[^/\\]/.test(next) || UNSAFE_CHARS.test(next)) return null;
  try {
    const url = new URL(next, NEXT_BASE);
    if (url.origin !== NEXT_BASE) return null;
    if (/^\/[/\\]/.test(url.pathname)) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const id = useId();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState<"form" | "google" | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const isSignup = mode === "cadastro";
  // New accounts go to onboarding; returning owners go back where they were.
  // TODO(fase 1, task 9): owners with a business land on /inicio instead.
  const destination = (!isSignup && next) || "/onboarding";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const parsed = schemas[mode].safeParse(data);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        fieldErrors[key] ??= issue.message;
      }
      setErrors(fieldErrors);
      // Move focus to the first invalid field so its error is read out.
      const first = (["name", "email", "password"] as const).find(
        (key) => fieldErrors[key],
      );
      if (first)
        form.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    setPending("form");
    try {
      const { error } = isSignup
        ? await authClient.signUp.email(
            parsed.data as z.infer<(typeof schemas)["cadastro"]>,
          )
        : await authClient.signIn.email(parsed.data);
      if (error) {
        setFormError(authErrorMessage(error));
        setPending(null);
        return;
      }
      router.replace(destination);
    } catch {
      setFormError(NETWORK_ERROR);
      setPending(null);
    }
  }

  async function onGoogle() {
    setFormError(null);
    setPending("google");
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/onboarding`,
      });
      if (error) {
        setFormError(error.status === 0 ? NETWORK_ERROR : GOOGLE_ERROR);
        setPending(null);
      }
    } catch {
      setFormError(NETWORK_ERROR);
      setPending(null);
    }
  }

  const passwordHintId = `${id}-password-dica`;
  const field = (name: keyof FieldErrors) => ({
    id: `${id}-${name}`,
    name,
    required: true,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name]
      ? `${id}-${name}-erro`
      : name === "password" && isSignup
        ? passwordHintId
        : undefined,
  });

  const fieldError = (name: keyof FieldErrors) =>
    errors[name] && (
      <p id={`${id}-${name}-erro`} className="text-sm text-destructive">
        {errors[name]}
      </p>
    );

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {isSignup ? "Criar conta" : "Entrar"}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {isSignup
          ? "Comece pelo plano Free, com 30 atendimentos por mês."
          : "Acesse o painel do seu negócio."}
      </p>

      <Button
        type="button"
        variant="outline"
        className="mt-8 h-11 w-full text-base"
        onClick={onGoogle}
        disabled={pending !== null}
      >
        {pending === "google" ? (
          <LoaderCircle className="animate-spin" data-icon="inline-start" />
        ) : (
          <GoogleMark />
        )}
        Continuar com Google
      </Button>

      <div className="my-6 flex items-center gap-4 text-sm text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        ou com e-mail
        <span className="h-px flex-1 bg-border" />
      </div>

      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        {isSignup && (
          <div className="flex flex-col gap-2">
            <label htmlFor={`${id}-name`} className="text-sm font-medium">
              Seu nome
            </label>
            <Input {...field("name")} autoComplete="name" />
            {fieldError("name")}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-email`} className="text-sm font-medium">
            E-mail
          </label>
          <Input
            {...field("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
          />
          {fieldError("email")}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-password`} className="text-sm font-medium">
            Senha
          </label>
          <div className="relative">
            <Input
              {...field("password")}
              type={showPassword ? "text" : "password"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
              aria-controls={`${id}-password`}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
              <span className="sr-only">
                {showPassword ? "Ocultar senha" : "Mostrar senha"}
              </span>
            </button>
          </div>
          {isSignup && !errors.password && (
            <p id={passwordHintId} className="text-sm text-muted-foreground">
              Pelo menos <span className="font-mono tabular-nums">8</span>{" "}
              caracteres.
            </p>
          )}
          {fieldError("password")}
        </div>

        {formError && (
          <p
            role="alert"
            className="rounded-md bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
          >
            {formError}
          </p>
        )}

        <Button
          type="submit"
          className="h-11 w-full text-base"
          disabled={pending !== null}
        >
          {pending === "form" && (
            <LoaderCircle className="animate-spin" data-icon="inline-start" />
          )}
          {isSignup ? "Criar conta" : "Entrar"}
        </Button>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        {isSignup ? "Já tem conta? " : "Ainda não tem conta? "}
        <Link
          href={
            isSignup
              ? `/entrar${next ? `?next=${encodeURIComponent(next)}` : ""}`
              : "/cadastro"
          }
          className="font-medium text-link underline-offset-4 hover:underline"
        >
          {isSignup ? "Entrar" : "Criar conta"}
        </Link>
      </p>
    </div>
  );
}

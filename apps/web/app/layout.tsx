import type { Metadata } from "next";
import { Chivo, Chivo_Mono } from "next/font/google";
import "./globals.css";

const chivo = Chivo({
  variable: "--font-chivo",
  subsets: ["latin"],
});

const chivoMono = Chivo_Mono({
  variable: "--font-chivo-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ruby",
  description: "Atendimento e agendamento pelo WhatsApp para o seu negócio.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${chivo.variable} ${chivoMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

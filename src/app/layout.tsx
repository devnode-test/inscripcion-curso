import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inscripción de Profesores",
  description: "Sistema de inscripción de cursos para profesores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background font-sans`}
      >
        <main className="w-full py-10 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        <footer className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          Informática |{" "}
          <a
            href="https://saintgeorge.cl"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Saint George&apos;s College
          </a>
        </footer>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

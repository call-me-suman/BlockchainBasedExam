"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ConnectButton, ThirdwebProvider } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isStudent =
    pathname?.startsWith("/student") || pathname?.startsWith("/exams");
  const switchLabel = isStudent ? "Go to Admin" : "Go to Student";
  const switchHref = isStudent ? "/admin" : "/student";

  return (
    <header className="sticky top-0 z-50 bg-[rgba(12,14,22,0.75)] backdrop-blur-md border-b border-white/10">
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="hidden sm:block">
              <Image
                src="/logo_with_name_without_background.png"
                alt="exuproc"
                width={160}
                height={28}
                className="object-contain"
              />
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!isHome && (
              <button
                onClick={() => router.push(switchHref)}
                className="rounded-md px-3 py-2 text-sm font-medium text-white/90 bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
              >
                {switchLabel}
              </button>
            )}
            <div className="ml-1">
              <ThirdwebConnect />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function LogoLoader() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 700);
    return () => clearTimeout(t);
  }, []);
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0b0f1a]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-16 w-16 animate-pulse">
          <Image
            src="/only_logo_white.png"
            alt="loading"
            fill
            sizes="64px"
            className="object-contain"
          />
        </div>
        <div className="h-1 w-40 overflow-hidden rounded bg-white/10">
          <div className="h-full w-1/2 animate-[slide_1.2s_ease-in-out_infinite] bg-white/40" />
        </div>
        <style jsx>{`
          @keyframes slide {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(50%);
            }
            100% {
              transform: translateX(200%);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

function ThirdwebConnect() {
  const clientId =
    process.env.NEXT_PUBLIC_CLIENT_ID ||
    process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ||
    "";
  const client = useMemo(() => createThirdwebClient({ clientId }), [clientId]);
  return <ConnectButton client={client} theme="dark" />;
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <title>exuproc | Decentralized Exam Platform</title>
        <link rel="icon" href="/only_logo_white.png" type="image/png" />
        <meta name="theme-color" content="#0b0f1a" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0b0f1a] text-white`}
      >
        <ThirdwebProvider>
          <LogoLoader />
          <Navbar />
          <main>{children}</main>
        </ThirdwebProvider>
      </body>
    </html>
  );
}

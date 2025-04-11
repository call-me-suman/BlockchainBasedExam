"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ConnectButton,
  ThirdwebProvider,
  useActiveAccount,
} from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const client = createThirdwebClient({
    clientId: "f74a735820f866854c58f30896bc36a5",
  });

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThirdwebProvider>
          <ConnectButton client={client} />
          {children}
        </ThirdwebProvider>
      </body>
    </html>
  );
}

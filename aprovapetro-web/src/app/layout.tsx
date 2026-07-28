import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FloatingChat } from "@/components/FloatingChat";
import { SessionGuard } from "@/components/SessionGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AprovaPETRO",
  description: "App de estudos gamificado",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-black`}
    >
      <body className="h-full flex flex-col items-center">
        <div className="w-full h-full max-w-md bg-[#0A0F0D] overflow-hidden relative shadow-2xl">
          {children}
          <FloatingChat />
          <SessionGuard />
        </div>
      </body>
    </html>
  );
}

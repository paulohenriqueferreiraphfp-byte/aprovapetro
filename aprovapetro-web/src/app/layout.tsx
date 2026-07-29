import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FloatingChat } from "@/components/FloatingChat";
import { SessionGuard } from "@/components/SessionGuard";
import { InstallPwaBanner } from "@/components/InstallPwaBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0A0F0D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "AprovaPETRO",
  description: "App de estudos gamificado",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AprovaPETRO",
  },
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
          <InstallPwaBanner />
          <SessionGuard />
        </div>
      </body>
    </html>
  );
}

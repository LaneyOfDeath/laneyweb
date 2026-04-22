import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import FeedbackButton from "@/components/FeedbackButton";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LaneyWeb — Live Intelligence Dashboard",
  description: "Real-time tracking of aircraft, marine, traffic, sports, stocks, news, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="h-full flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto min-h-0 pt-12 md:pt-0">
          {children}
        </main>
        <FeedbackButton />
        <Analytics />
      </body>
    </html>
  );
}

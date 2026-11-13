import type { Metadata } from "next";
import { Barlow_Condensed, Barlow_Semi_Condensed } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import FeedbackButton from "@/components/FeedbackButton";
import { RadioProvider } from "@/context/RadioContext";
import RadioMiniPlayer from "@/components/RadioMiniPlayer";
import { Analytics } from "@vercel/analytics/next";

const bodyFont = Barlow_Semi_Condensed({
  variable: "--font-pl-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const displayFont = Barlow_Condensed({
  variable: "--font-pl-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "LaneyWeb",
  description: "Live planes, trams, power, weather, football and more, on one site.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable} h-full`}>
      <body className="h-full flex overflow-hidden">
        <RadioProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto min-h-0 pt-12 md:pt-0">
            {children}
          </main>
          <FeedbackButton />
          <RadioMiniPlayer />
        </RadioProvider>
        <Analytics />
      </body>
    </html>
  );
}

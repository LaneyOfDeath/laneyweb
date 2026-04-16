import { Metadata } from "next";
import { Gamepad2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import GamingDashboard from "@/components/GamingDashboard";

export const metadata: Metadata = {
  title: "Gaming Top 10 — LaneyWeb",
};

export default function GamingPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Gamepad2}
        iconColor="text-pink-400"
        title="Gaming Top 10"
        subtitle="Steam concurrent players · SteamSpy API · Hourly updates"
        live={false}
      />
      <div className="flex-1 overflow-y-auto">
        <GamingDashboard />
      </div>
    </div>
  );
}

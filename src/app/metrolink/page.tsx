import { Metadata } from "next";
import { TramFront } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import MetrolinkDashboard from "@/components/personal/MetrolinkDashboard";

export const metadata: Metadata = {
  title: "Metrolink — LaneyWeb",
};

export default function Page() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={TramFront}
        iconColor="text-yellow-400"
        title="Metrolink"
        subtitle="Live tram departures for any stop · TfGM open data"
      />
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <MetrolinkDashboard />
      </div>
    </div>
  );
}

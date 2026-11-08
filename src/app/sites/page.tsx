import { Metadata } from "next";
import { Activity } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SitesDashboard from "@/components/personal/SitesDashboard";

export const metadata: Metadata = {
  title: "My Sites — LaneyWeb",
};

export default function Page() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Activity}
        iconColor="text-emerald-400"
        title="My Sites"
        subtitle="Health of chgraph, StreetSiege API and the map server"
      />
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <SitesDashboard />
      </div>
    </div>
  );
}

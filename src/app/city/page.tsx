import { Metadata } from "next";
import { Shield } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import CityDashboard from "@/components/personal/CityDashboard";

export const metadata: Metadata = {
  title: "Man City — LaneyWeb",
};

export default function Page() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Shield}
        iconColor="text-sky-400"
        title="Man City"
        subtitle="Next match, live score, results and the Premier League table · ESPN data"
      />
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <CityDashboard />
      </div>
    </div>
  );
}

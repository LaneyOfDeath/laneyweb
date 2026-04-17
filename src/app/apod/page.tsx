import { Metadata } from "next";
import { Telescope } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ApodDashboard from "@/components/ApodDashboard";

export const metadata: Metadata = {
  title: "Astronomy Picture of the Day — LaneyWeb",
};

export default function ApodPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Telescope}
        iconColor="text-violet-400"
        title="Astronomy Picture of the Day"
        subtitle="Daily space imagery & explanation · NASA APOD · Browse any date"
      />
      <div className="flex-1 min-h-0">
        <ApodDashboard />
      </div>
    </div>
  );
}

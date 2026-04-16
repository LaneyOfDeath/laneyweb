import PageHeader from "@/components/PageHeader";
import InternetDashboard from "@/components/InternetDashboard";
import { Wifi } from "lucide-react";

export default function InternetPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Wifi}
        title="Internet"
        subtitle="Hacker News top stories, GitHub trending repos & live Wikipedia edits"
        iconColor="text-rose-400"
        live
      />
      <div className="flex-1 overflow-y-auto">
        <InternetDashboard />
      </div>
    </div>
  );
}

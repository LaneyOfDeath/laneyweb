import PageHeader from "@/components/PageHeader";
import ISSDashboard from "@/components/ISSDashboard";
import { Rocket } from "lucide-react";

export default function ISSPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Rocket}
        iconColor="text-cyan-400"
        title="ISS Tracker"
        subtitle="Live position, NASA video feed & crew — updates every 10 seconds"
      />
      <div className="flex-1 min-h-0">
        <ISSDashboard />
      </div>
    </div>
  );
}

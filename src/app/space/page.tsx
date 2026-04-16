import PageHeader from "@/components/PageHeader";
import SpaceDashboard from "@/components/SpaceDashboard";
import { Rocket } from "lucide-react";

export default function SpacePage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Rocket}
        title="Space"
        subtitle="ISS live position, upcoming rocket launches & near-Earth asteroids"
        iconColor="text-violet-400"
        live
      />
      <div className="flex-1 overflow-y-auto">
        <SpaceDashboard />
      </div>
    </div>
  );
}

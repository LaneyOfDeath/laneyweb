import PageHeader from "@/components/PageHeader";
import RadioDashboard from "@/components/RadioDashboard";
import { Radio } from "lucide-react";

export default function RadioPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Radio}
        title="Radio"
        subtitle="Browse & stream live radio from around the world · search by name or genre"
        iconColor="text-violet-400"
        live
      />
      <div className="flex-1 overflow-y-auto">
        <RadioDashboard />
      </div>
    </div>
  );
}

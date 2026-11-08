import { Metadata } from "next";
import { Trash2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import BinsDashboard from "@/components/personal/BinsDashboard";

export const metadata: Metadata = {
  title: "Bin Day — LaneyWeb",
};

export default function Page() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Trash2}
        iconColor="text-emerald-400"
        title="Bin Day"
        subtitle="Which bins go out next · Oldham Council"
      />
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <BinsDashboard />
      </div>
    </div>
  );
}

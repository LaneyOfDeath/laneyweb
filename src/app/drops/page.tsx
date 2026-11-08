import { Metadata } from "next";
import { Gamepad2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import DropsDashboard from "@/components/personal/DropsDashboard";

export const metadata: Metadata = {
  title: "Game Drops — LaneyWeb",
};

export default function Page() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Gamepad2}
        iconColor="text-emerald-400"
        title="Game Drops"
        subtitle="Release countdowns, Game Pass coming and leaving, Steam deals"
      />
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <DropsDashboard />
      </div>
    </div>
  );
}

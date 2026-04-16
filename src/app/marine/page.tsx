import { Metadata } from "next";
import { Anchor } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import MarineMap from "@/components/MarineMap";

export const metadata: Metadata = {
  title: "Marine Traffic — LaneyWeb",
};

export default function MarinePage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Anchor}
        iconColor="text-blue-400"
        title="Marine Traffic"
        subtitle="AIS vessel tracking · OpenSeaMap overlays · AISHub free tier (registration required)"
      />
      <div className="flex-1 min-h-0">
        <MarineMap />
      </div>
    </div>
  );
}

import { Metadata } from "next";
import { Newspaper } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import NewsDashboard from "@/components/NewsDashboard";

export const metadata: Metadata = {
  title: "Live News — LaneyWeb",
};

export default function NewsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Newspaper}
        iconColor="text-purple-400"
        title="Live News"
        subtitle="Breaking news across all categories · BBC RSS (no key) + GNews/NewsAPI with key"
      />
      <div className="flex-1 overflow-y-auto">
        <NewsDashboard />
      </div>
    </div>
  );
}

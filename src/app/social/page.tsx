import PageHeader from "@/components/PageHeader";
import SocialDashboard from "@/components/SocialDashboard";
import { Globe } from "lucide-react";

export default function SocialPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Globe}
        title="Online & Social"
        subtitle="Live news · Hacker News, GitHub trending & Wikipedia · Mastodon trending"
        iconColor="text-rose-400"
        live
      />
      <div className="flex-1 min-h-0">
        <SocialDashboard />
      </div>
    </div>
  );
}

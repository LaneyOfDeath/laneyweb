import PageHeader from "@/components/PageHeader";
import MastodonDashboard from "@/components/MastodonDashboard";
import { MessagesSquare } from "lucide-react";

export const metadata = { title: "Mastodon Trending · LaneyWeb" };

export default function MastodonPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={MessagesSquare}
        title="Mastodon Trending"
        subtitle="Trending posts & hashtags from mastodon.social · public API · no key required"
        iconColor="text-indigo-400"
        live
      />
      <div className="flex-1 overflow-y-auto">
        <MastodonDashboard />
      </div>
    </div>
  );
}

import PageHeader from "@/components/PageHeader";
import CompaniesDashboard from "@/components/CompaniesDashboard";
import { Building2 } from "lucide-react";

export default function CompaniesPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Building2}
        title="Companies House"
        subtitle="UK company register · officers, PSC & filing history · company-information.service.gov.uk"
        iconColor="text-cyan-400"
        live
      />
      <div className="flex-1 overflow-y-auto">
        <CompaniesDashboard />
      </div>
    </div>
  );
}

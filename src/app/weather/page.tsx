import PageHeader from "@/components/PageHeader";
import WeatherDashboard from "@/components/WeatherDashboard";
import { CloudSun } from "lucide-react";

export default function WeatherPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={CloudSun}
        title="Weather"
        subtitle="Global conditions, hourly forecasts & air quality via Open-Meteo"
        iconColor="text-sky-300"
        live
      />
      <div className="flex-1 overflow-y-auto">
        <WeatherDashboard />
      </div>
    </div>
  );
}

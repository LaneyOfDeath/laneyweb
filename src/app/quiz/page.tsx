import PageHeader from "@/components/PageHeader";
import QuizDashboard from "@/components/QuizDashboard";
import { HelpCircle } from "lucide-react";

export default function QuizPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Trivia Quiz"
        subtitle="Test your knowledge — 10 questions from Open Trivia DB"
        icon={HelpCircle}
        iconColor="text-yellow-300"
        live={false}
      />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <QuizDashboard />
      </div>
    </div>
  );
}

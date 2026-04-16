import PageHeader from "@/components/PageHeader";
import QuizDashboard from "@/components/QuizDashboard";

export default function QuizPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Trivia Quiz"
        subtitle="Test your knowledge — 10 questions from Open Trivia DB"
        icon="🧠"
      />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <QuizDashboard />
      </div>
    </div>
  );
}

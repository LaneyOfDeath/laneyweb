"use client";

import { useState, useCallback } from "react";
import { RefreshCw, Trophy, CheckCircle, XCircle, ChevronRight } from "lucide-react";

interface Question {
  category: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

const CATEGORIES = [
  { value: "", label: "Any Category" },
  { value: "9", label: "General Knowledge" },
  { value: "10", label: "Books" },
  { value: "11", label: "Film" },
  { value: "12", label: "Music" },
  { value: "14", label: "Television" },
  { value: "15", label: "Video Games" },
  { value: "17", label: "Science & Nature" },
  { value: "18", label: "Computers" },
  { value: "19", label: "Mathematics" },
  { value: "21", label: "Sports" },
  { value: "22", label: "Geography" },
  { value: "23", label: "History" },
];

const DIFFICULTIES = [
  { value: "", label: "Any Difficulty" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-green-400",
  medium: "text-yellow-400",
  hard: "text-red-400",
};

function decode(str: string) {
  if (typeof window === "undefined") return str;
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function sortAnswers(arr: string[]): string[] {
  return [...arr].sort((a, b) => decode(a).localeCompare(decode(b)));
}

export default function QuizDashboard() {
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[][]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);

  const startQuiz = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ amount: "10" });
      if (category) params.set("category", category);
      if (difficulty) params.set("difficulty", difficulty);
      const res = await fetch(`/api/quiz?${params}`);
      const data = await res.json();
      if (!data.results?.length) {
        setError("No questions found — try a different category or difficulty.");
        setLoading(false);
        return;
      }
      const qs: Question[] = data.results;
      const answers = qs.map((q) => sortAnswers(shuffle([q.correct_answer, ...q.incorrect_answers])));
      setQuestions(qs);
      setShuffledAnswers(answers);
      setCurrent(0);
      setScore(0);
      setSelected(null);
      setFinished(false);
      setStarted(true);
    } catch {
      setError("Failed to load questions. Try again.");
    } finally {
      setLoading(false);
    }
  }, [category, difficulty]);

  const handleAnswer = (answer: string) => {
    if (selected) return;
    setSelected(answer);
    if (answer === questions[current].correct_answer) {
      setScore((s) => s + 1);
    }
  };

  const next = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  const q = questions[current];
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-12">
        <Trophy className="w-14 h-14 text-yellow-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-1">Trivia Quiz</h2>
        <p className="text-sm text-[#64748b] mb-8">10 questions · Powered by Open Trivia DB</p>

        <div className="w-full max-w-sm space-y-3 mb-6">
          <div>
            <label className="text-xs text-[#64748b] uppercase tracking-widest mb-1.5 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#111827] border border-[#1e2a3a] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#64748b] uppercase tracking-widest mb-1.5 block">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-[#111827] border border-[#1e2a3a] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        <button
          onClick={startQuiz}
          disabled={loading}
          className="px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
          {loading ? "Loading…" : "Start Quiz"}
        </button>
      </div>
    );
  }

  if (finished) {
    const grade = pct >= 80 ? "Excellent!" : pct >= 60 ? "Good job!" : pct >= 40 ? "Not bad!" : "Keep practising!";
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 py-12">
        <div className="w-28 h-28 rounded-full border-4 border-cyan-400 flex items-center justify-center mb-6"
          style={{ background: "rgba(6,182,212,0.1)" }}>
          <span className="text-4xl font-black text-white">{pct}%</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">{grade}</h2>
        <p className="text-[#64748b] text-sm mb-8">You got <span className="text-white font-semibold">{score}/{questions.length}</span> correct</p>
        <button
          onClick={() => { setStarted(false); setQuestions([]); }}
          className="px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-4 py-4 max-w-2xl mx-auto w-full">
      {/* Progress */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[#64748b]">Question {current + 1} of {questions.length}</span>
        <span className="text-xs font-semibold text-cyan-400">{score} correct</span>
      </div>
      <div className="w-full h-1.5 bg-[#1e2a3a] rounded-full mb-5">
        <div
          className="h-1.5 bg-cyan-400 rounded-full transition-all duration-300"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest text-[#64748b]">{decode(q.category)}</span>
        <span className={`text-[10px] uppercase tracking-widest font-semibold ${DIFFICULTY_COLORS[q.difficulty] ?? "text-[#64748b]"}`}>
          · {q.difficulty}
        </span>
      </div>
      <p className="text-white font-semibold text-base leading-snug mb-5">{decode(q.question)}</p>

      {/* Answers */}
      <div className="space-y-2.5 flex-1">
        {shuffledAnswers[current]?.map((answer) => {
          const isCorrect = answer === q.correct_answer;
          const isSelected = selected === answer;
          let style = "border-[#1e2a3a] bg-[#111827] text-[#94a3b8] hover:border-[#2d3f55] hover:text-white";
          if (selected) {
            if (isCorrect) style = "border-green-500 bg-green-500/10 text-green-300";
            else if (isSelected) style = "border-red-500 bg-red-500/10 text-red-300";
            else style = "border-[#1e2a3a] bg-[#111827] text-[#4a5568] opacity-50";
          }
          return (
            <button
              key={answer}
              onClick={() => handleAnswer(answer)}
              disabled={!!selected}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 flex items-center gap-3 ${style}`}
            >
              {selected && isCorrect && <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />}
              {selected && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
              {(!selected || (!isCorrect && !isSelected)) && <span className="w-4 h-4 flex-shrink-0" />}
              {decode(answer)}
            </button>
          );
        })}
      </div>

      {/* Next */}
      {selected && (
        <button
          onClick={next}
          className="mt-5 w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition-colors flex items-center justify-center gap-2"
        >
          {current + 1 >= questions.length ? "See Results" : "Next Question"}
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

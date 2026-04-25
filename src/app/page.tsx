"use client";

import { useState, useEffect, useCallback } from "react";
import KanjiTest from "./components/KanjiTest";
import QuestionSelector from "./components/QuestionSelector";
import { getExcludedQuestions } from "@/lib/fsrsStorage";

interface Question {
  id: number;
  question: string;
  answer: string;
}

interface TestData {
  questions: Question[];
}

type TestMode = "grid" | "flashcard";

export default function Home() {
  const [showSelector, setShowSelector] = useState(true);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [testData, setTestData] = useState<TestData | null>(null);
  const [currentGrade, setCurrentGrade] = useState<number>(7);
  const [testMode, setTestMode] = useState<TestMode>("grid");

  useEffect(() => {
    const dataSource = `kanji_grade${currentGrade}.json`;
    fetch(`/${dataSource}`)
      .then((res) => res.json())
      .then((data: TestData) => {
        setTestData(data);
        // Don't auto-select questions - let FSRS mode handle selection
      })
      .catch((error) => console.error("Error loading test data:", error));
  }, [currentGrade]);

  const handleToggleQuestion = (questionId: number) => {
    setSelectedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (testData) {
      const excludedQuestions = getExcludedQuestions(currentGrade);
      const allQuestionIds = new Set(
        testData.questions
          .filter((q) => !excludedQuestions.has(q.id))
          .map((q) => q.id)
      );
      setSelectedQuestions(allQuestionIds);
    }
  };

  const handleDeselectAll = () => {
    setSelectedQuestions(new Set());
  };

  const handleSetQuestions = useCallback((questionIds: number[]) => {
    setSelectedQuestions(new Set(questionIds));
  }, []);

  const handleStartTest = () => {
    setShowSelector(false);
  };

  const handleBackToSelector = () => {
    setShowSelector(true);
  };

  const handleGradeChange = (grade: number) => {
    setCurrentGrade(grade);
  };

  if (!testData) {
    return (
      <div className="h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-gray-600">テストデータを読み込み中...</div>
      </div>
    );
  }

  if (showSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <QuestionSelector
          questions={testData.questions}
          selectedQuestions={selectedQuestions}
          onToggleQuestion={handleToggleQuestion}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onSetQuestions={handleSetQuestions}
          onStartTest={handleStartTest}
          currentGrade={currentGrade}
          onGradeChange={handleGradeChange}
          testMode={testMode}
          onTestModeChange={setTestMode}
        />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden print:from-white">
      <main className="h-full">
        <KanjiTest
          selectedQuestionIds={selectedQuestions}
          onBackToSelector={handleBackToSelector}
          currentGrade={currentGrade}
          testMode={testMode}
        />
      </main>
    </div>
  );
}

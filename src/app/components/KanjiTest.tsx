"use client";

import { useState, useEffect } from "react";
import TestGrid from "./TestGrid";

interface TestData {
  tests: {
    id: number;
    question: string[];
  }[];
}

export default function KanjiTest() {
  const [testData, setTestData] = useState<TestData | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetch("/kanji.json")
      .then((res) => res.json())
      .then((data: TestData) => {
        setTestData(data);
        // Initialize answers object
        const initialAnswers: { [key: number]: string } = {};
        data.tests[0]?.question.forEach((_, index) => {
          initialAnswers[index] = "";
        });
        setAnswers(initialAnswers);
      })
      .catch((error) => console.error("Error loading test data:", error));
  }, []);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  const formatQuestion = (text: string) => {
    // Replace <text> with bold formatting
    return text.replace(/<([^>]+)>/g, "<strong>$1</strong>");
  };

  if (!testData) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-600">テストデータを読み込み中...</div>
      </div>
    );
  }

  const questions = testData.tests[0]?.question || [];

  return (
    <div className="h-screen flex flex-col max-w-6xl mx-auto px-2 py-1 print:w-full print:max-w-none print:p-0 print:h-screen print:flex print:flex-col print:box-border">
      <div className="flex justify-between items-center mb-2 print:hidden flex-shrink-0">
        <div></div>
        <h1 className="text-xl font-bold text-center text-gray-900">
          漢字テスト
        </h1>
        <button
          onClick={() => window.print()}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs transition-colors"
        >
          印刷
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-2 flex-1 flex flex-col min-h-0 print:shadow-none print:p-1 print:h-screen print:flex print:flex-col print:box-border">
        <TestGrid
          questions={questions}
          answers={answers}
          onAnswerChange={handleAnswerChange}
          formatQuestion={formatQuestion}
        />
      </div>
    </div>
  );
}
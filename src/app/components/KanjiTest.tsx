"use client";

import { useState, useEffect } from "react";
import TestGrid from "./TestGrid";
import Header from "./Header";

interface TestData {
  tests: {
    id: number;
    question: string[];
  }[];
}

export default function KanjiTest() {
  const [testData, setTestData] = useState<TestData | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<number>(1);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetch("/kanji_grade3.json")
      .then((res) => res.json())
      .then((data: TestData) => {
        setTestData(data);
      })
      .catch((error) => console.error("Error loading test data:", error));
  }, []);

  // Initialize answers when test data or selected test changes
  useEffect(() => {
    if (testData) {
      const selectedTest = testData.tests.find(test => test.id === selectedTestId);
      if (selectedTest) {
        const initialAnswers: { [key: number]: string } = {};
        selectedTest.question.forEach((_, index) => {
          initialAnswers[index] = "";
        });
        setAnswers(initialAnswers);
      }
    }
  }, [testData, selectedTestId]);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  const formatQuestion = (text: string) => {
    // Replace <text> with emphasized formatting
    return text.replace(/<([^>]+)>/g, '<span style="font-weight: bold; color: #dc2626; text-decoration: underline;">$1</span>');
  };

  if (!testData) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-600">テストデータを読み込み中...</div>
      </div>
    );
  }

  const selectedTest = testData?.tests.find(test => test.id === selectedTestId);
  const questions = selectedTest?.question || [];

  return (
    <div className="h-screen flex flex-col max-w-6xl mx-auto px-2 print:w-full print:max-w-full print:box-border">
      <div className="flex-0 print:hidden">
        <Header
          testData={testData}
          selectedTestId={selectedTestId}
          onTestChange={setSelectedTestId}
          onPrint={() => window.print()}
        />
      </div>
      
      <div className="flex-1 bg-white rounded-lg shadow-lg mb-4 py-4 flex flex-col gap-4 min-h-0 print:shadow-none print:p-1 print:h-screen print:box-border">
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
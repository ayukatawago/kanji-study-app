"use client";

import { useState, useEffect } from "react";
import TestGrid from "./TestGrid";
import Header from "./Header";
import AnswerPopup from "./AnswerPopup";

interface Question {
  id: number;
  question: string;
  answer: string;
}

interface TestData {
  questions: Question[];
}

interface KanjiTestProps {
  selectedQuestionIds?: Set<number>;
  onBackToSelector?: () => void;
  currentGrade?: number;
}

export default function KanjiTest({ selectedQuestionIds, onBackToSelector, currentGrade = 3 }: KanjiTestProps = {}) {
  const [testData, setTestData] = useState<TestData | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<number>(1);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showAnswer, setShowAnswer] = useState<{ questionIndex: number; answer: string } | null>(null);

  useEffect(() => {
    const dataSource = `kanji_grade${currentGrade}.json`;
    fetch(`/${dataSource}`)
      .then((res) => res.json())
      .then((data: TestData) => {
        // Filter questions based on selectedQuestionIds if provided
        if (selectedQuestionIds && selectedQuestionIds.size > 0) {
          const filteredQuestions = data.questions.filter(q => selectedQuestionIds.has(q.id));
          setTestData({ questions: filteredQuestions });
        } else {
          setTestData(data);
        }
        setSelectedTestId(1); // Reset to first test when changing data source
      })
      .catch((error) => console.error("Error loading test data:", error));
  }, [currentGrade, selectedQuestionIds]);

  // Initialize answers when test data or selected test changes
  useEffect(() => {
    if (testData) {
      const initialAnswers: { [key: number]: string } = {};
      // Initialize 10 answers for each test (questions 0-9)
      for (let i = 0; i < 10; i++) {
        initialAnswers[i] = "";
      }
      setAnswers(initialAnswers);
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

  const handleQuestionClick = (questionIndex: number) => {
    // Get the answer for the clicked question
    const startIndex = (selectedTestId - 1) * 10;
    const questionData = testData?.questions[startIndex + questionIndex];
    if (questionData) {
      setShowAnswer({
        questionIndex,
        answer: questionData.answer
      });
    }
  };


  if (!testData) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-600">テストデータを読み込み中...</div>
      </div>
    );
  }

  // Calculate total number of tests (20 questions / 10 per test = 2 tests)
  const totalTests = testData ? Math.ceil(testData.questions.length / 10) : 0;
  
  // Get questions for the selected test (10 questions per test)
  const startIndex = (selectedTestId - 1) * 10;
  const endIndex = startIndex + 10;
  const questions = testData ? testData.questions.slice(startIndex, endIndex).map(q => q.question) : [];

  return (
    <div className="h-screen flex flex-col max-w-6xl mx-auto px-2 print:w-full print:max-w-full print:box-border">
      <div className="flex-0 print:hidden">
        <Header
          testData={testData}
          selectedTestId={selectedTestId}
          onTestChange={setSelectedTestId}
          onPrint={() => window.print()}
          onBackToSelector={onBackToSelector}
        />
      </div>
      
      <div className="flex-1 bg-white rounded-lg shadow-lg mb-4 py-4 flex flex-col gap-4 min-h-0 print:shadow-none print:p-1 print:h-screen print:box-border">
        <TestGrid
          questions={questions}
          answers={answers}
          onAnswerChange={handleAnswerChange}
          formatQuestion={formatQuestion}
          onQuestionClick={handleQuestionClick}
        />
      </div>

      {/* Answer Popup */}
      {showAnswer && (
        <AnswerPopup
          questionIndex={showAnswer.questionIndex}
          answer={showAnswer.answer}
          onClose={() => setShowAnswer(null)}
        />
      )}
    </div>
  );
}
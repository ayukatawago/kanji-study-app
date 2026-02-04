"use client";

import { useState, useEffect } from "react";
import { Rating } from "ts-fsrs";
import TestGrid from "./TestGrid";
import Header from "./Header";
import AnswerPopup from "./AnswerPopup";
import { recordReview } from "@/lib/fsrsScheduler";
import { initializeStorage } from "@/lib/fsrsStorage";

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

export default function KanjiTest({
  selectedQuestionIds,
  onBackToSelector,
  currentGrade = 3,
}: KanjiTestProps = {}) {
  const [testData, setTestData] = useState<TestData | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<number>(1);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showAnswer, setShowAnswer] = useState<{
    questionIndex: number;
    answer: string;
  } | null>(null);
  const [correctness, setCorrectness] = useState<{
    [key: number]: boolean | null;
  }>({});
  const [showAnswers, setShowAnswers] = useState<boolean>(false);

  // Initialize FSRS storage on mount
  useEffect(() => {
    initializeStorage();
  }, []);

  useEffect(() => {
    const dataSource = `kanji_grade${currentGrade}.json`;
    fetch(`/${dataSource}`)
      .then((res) => res.json())
      .then((data: TestData) => {
        // Filter questions based on selectedQuestionIds if provided
        if (selectedQuestionIds && selectedQuestionIds.size > 0) {
          const filteredQuestions = data.questions.filter((q) =>
            selectedQuestionIds.has(q.id)
          );
          setTestData({ questions: filteredQuestions });
        } else {
          setTestData(data);
        }
        setSelectedTestId(1); // Reset to first test when changing data source
      })
      .catch((error) => console.error("Error loading test data:", error));
  }, [currentGrade, selectedQuestionIds]);

  // Initialize answers and correctness when test data or selected test changes
  useEffect(() => {
    if (testData) {
      const initialAnswers: { [key: number]: string } = {};
      const initialCorrectness: { [key: number]: boolean | null } = {};
      // Initialize 10 answers for each test (questions 0-9)
      for (let i = 0; i < 10; i++) {
        initialAnswers[i] = "";
        initialCorrectness[i] = null;
      }
      setAnswers(initialAnswers);
      setCorrectness(initialCorrectness);
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
    return text.replace(
      /<([^>]+)>/g,
      '<span style="font-weight: bold; color: #dc2626; text-decoration: underline;">$1</span>'
    );
  };

  const handleQuestionClick = (questionIndex: number) => {
    // Get the answer for the clicked question
    const startIndex = (selectedTestId - 1) * 10;
    const questionData = testData?.questions[startIndex + questionIndex];
    if (questionData) {
      setShowAnswer({
        questionIndex,
        answer: questionData.answer,
      });
    }
  };

  const handleMarkCorrect = (questionIndex: number) => {
    const startIndex = (selectedTestId - 1) * 10;
    const questionData = testData?.questions[startIndex + questionIndex];

    if (!questionData) return;

    // Update local state
    setCorrectness((prev) => ({
      ...prev,
      [questionIndex]: true,
    }));

    // Record review in FSRS
    const rating = Rating.Good; // Correct answer = Good rating
    recordReview(
      questionData.id,
      currentGrade,
      rating,
      true, // isCorrect
      answers[questionIndex] // user's answer
    );
  };

  const handleMarkIncorrect = (questionIndex: number) => {
    const startIndex = (selectedTestId - 1) * 10;
    const questionData = testData?.questions[startIndex + questionIndex];

    if (!questionData) return;

    // Update local state
    setCorrectness((prev) => ({
      ...prev,
      [questionIndex]: false,
    }));

    // Record review in FSRS
    const rating = Rating.Again; // Incorrect answer = Again rating
    recordReview(
      questionData.id,
      currentGrade,
      rating,
      false, // isCorrect
      answers[questionIndex] // user's answer
    );
  };

  if (!testData) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-600">テストデータを読み込み中...</div>
      </div>
    );
  }

  // Get questions for the selected test (10 questions per test)
  const startIndex = (selectedTestId - 1) * 10;
  const endIndex = startIndex + 10;
  const questions = testData
    ? testData.questions.slice(startIndex, endIndex).map((q) => q.question)
    : [];

  // Get displayed answers (either user's answers or correct answers if showAnswers is true)
  const displayedAnswers: { [key: number]: string } = {};
  if (testData) {
    for (let i = 0; i < 10; i++) {
      const questionData = testData.questions[startIndex + i];
      if (questionData && showAnswers) {
        displayedAnswers[i] = questionData.answer;
      } else {
        displayedAnswers[i] = answers[i] || "";
      }
    }
  }

  return (
    <div className="h-screen flex flex-col max-w-6xl mx-auto px-2 print:w-full print:max-w-full print:box-border">
      <div className="flex-0 print:hidden">
        <Header
          testData={testData}
          selectedTestId={selectedTestId}
          onTestChange={setSelectedTestId}
          onPrint={() => window.print()}
          onBackToSelector={onBackToSelector}
          showAnswers={showAnswers}
          onToggleAnswers={() => setShowAnswers(!showAnswers)}
        />
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-lg mb-4 py-4 flex flex-col gap-4 min-h-0 print:shadow-none print:p-1 print:h-screen print:box-border">
        <TestGrid
          questions={questions}
          answers={displayedAnswers}
          onAnswerChange={handleAnswerChange}
          formatQuestion={formatQuestion}
          onQuestionClick={handleQuestionClick}
          correctness={correctness}
          onMarkCorrect={handleMarkCorrect}
          onMarkIncorrect={handleMarkIncorrect}
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

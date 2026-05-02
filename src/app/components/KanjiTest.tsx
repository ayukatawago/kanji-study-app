"use client";

import { useState, useEffect } from "react";
import { Rating } from "ts-fsrs";
import TestGrid from "./TestGrid";
import Header from "./Header";
import AnswerPopup from "./AnswerPopup";
import FlashCard from "./FlashCard";
import { recordReview } from "@/lib/fsrsScheduler";
import { initializeStorage } from "@/lib/fsrsStorage";

interface Question {
  id: number;
  question: string;
  answer: string;
  type?: string;
  group: number;
}

/** Raw JSON format from the data files */
interface GradeFile {
  groups: {
    groupId: number;
    questions: Omit<Question, "group">[];
  }[];
}

interface TestData {
  questions: Question[];
}

interface KanjiTestProps {
  selectedQuestionIds?: Set<number>;
  onBackToSelector?: () => void;
  currentGrade?: number;
  testMode?: "grid" | "flashcard";
}

const PAGE_SIZE = 10;

export default function KanjiTest({
  selectedQuestionIds,
  onBackToSelector,
  currentGrade = 7,
  testMode = "grid",
}: KanjiTestProps = {}) {
  const [testData, setTestData] = useState<TestData | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
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
      .then((data: GradeFile) => {
        // Flatten nested groups into a single question array
        const allQuestions: Question[] = data.groups.flatMap((g) =>
          g.questions.map((q) => ({ ...q, group: g.groupId }))
        );

        // Filter questions based on selectedQuestionIds if provided
        const filtered =
          selectedQuestionIds && selectedQuestionIds.size > 0
            ? allQuestions.filter((q) => selectedQuestionIds.has(q.id))
            : allQuestions;

        // Shuffle using Fisher-Yates
        const shuffled = [...filtered];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        setTestData({ questions: shuffled });
      })
      .catch((error) => console.error("Error loading test data:", error));
  }, [currentGrade, selectedQuestionIds]);

  // Initialize answers and correctness when test data changes
  useEffect(() => {
    if (testData) {
      const initialAnswers: { [key: number]: string } = {};
      const initialCorrectness: { [key: number]: boolean | null } = {};
      for (let i = 0; i < testData.questions.length; i++) {
        initialAnswers[i] = "";
        initialCorrectness[i] = null;
      }
      setAnswers(initialAnswers);
      setCorrectness(initialCorrectness);
    }
  }, [testData]);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  const formatQuestion = (text: string) => {
    return text.replace(
      /<([^>]+)>/g,
      '<span style="font-weight: bold; color: #dc2626; text-decoration: underline;">$1</span>'
    );
  };

  const handleQuestionClick = (questionIndex: number) => {
    const questionData = testData?.questions[questionIndex];
    if (questionData) {
      setShowAnswer({
        questionIndex,
        answer: questionData.answer,
      });
    }
  };

  const handleMarkCorrect = (questionIndex: number) => {
    const questionData = testData?.questions[questionIndex];
    if (!questionData) return;
    setCorrectness((prev) => ({ ...prev, [questionIndex]: true }));
    recordReview(
      questionData.id,
      currentGrade,
      Rating.Good,
      true,
      answers[questionIndex]
    );
  };

  const handleMarkIncorrect = (questionIndex: number) => {
    const questionData = testData?.questions[questionIndex];
    if (!questionData) return;
    setCorrectness((prev) => ({ ...prev, [questionIndex]: false }));
    recordReview(
      questionData.id,
      currentGrade,
      Rating.Again,
      false,
      answers[questionIndex]
    );
  };

  // Flash card mode handlers — use global card index directly
  const handleFlashCardMarkCorrect = () => {
    const questionData = testData?.questions[currentCardIndex];
    if (!questionData) return;
    setCorrectness((prev) => ({ ...prev, [currentCardIndex]: true }));
    recordReview(questionData.id, currentGrade, Rating.Good, true);
  };

  const handleFlashCardMarkIncorrect = () => {
    const questionData = testData?.questions[currentCardIndex];
    if (!questionData) return;
    setCorrectness((prev) => ({ ...prev, [currentCardIndex]: false }));
    recordReview(questionData.id, currentGrade, Rating.Again, false);
  };

  if (!testData) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-600">テストデータを読み込み中...</div>
      </div>
    );
  }

  // Flash card mode
  if (testMode === "flashcard") {
    const currentQuestion = testData.questions[currentCardIndex];
    return (
      <FlashCard
        question={currentQuestion.question}
        answer={currentQuestion.answer}
        questionType={currentQuestion.type}
        currentIndex={currentCardIndex}
        totalCount={testData.questions.length}
        isCorrect={correctness[currentCardIndex] ?? null}
        onMarkCorrect={handleFlashCardMarkCorrect}
        onMarkIncorrect={handleFlashCardMarkIncorrect}
        onNext={() =>
          setCurrentCardIndex((i) =>
            Math.min(i + 1, testData.questions.length - 1)
          )
        }
        onPrev={() => setCurrentCardIndex((i) => Math.max(i - 1, 0))}
        onBackToSelector={onBackToSelector}
        formatQuestion={formatQuestion}
      />
    );
  }

  // Grid mode — all questions split into pages of PAGE_SIZE
  const pageCount = Math.ceil(testData.questions.length / PAGE_SIZE);

  return (
    <div className="flex flex-col max-w-6xl mx-auto px-2 print:block print:w-full print:max-w-full print:px-0 print:box-border">
      <div className="sticky top-0 z-10 bg-blue-50/95 backdrop-blur-sm print:hidden">
        <Header
          onPrint={() => window.print()}
          onBackToSelector={onBackToSelector}
          showAnswers={showAnswers}
          onToggleAnswers={() => setShowAnswers(!showAnswers)}
        />
      </div>

      {Array.from({ length: pageCount }, (_, pageIdx) => {
        const start = pageIdx * PAGE_SIZE;
        const pageQs = testData.questions.slice(start, start + PAGE_SIZE);
        const pageAnswers: { [key: number]: string } = {};
        const pageCorrectness: { [key: number]: boolean | null } = {};
        for (let i = 0; i < pageQs.length; i++) {
          const gi = start + i;
          pageAnswers[i] = showAnswers ? pageQs[i].answer : answers[gi] || "";
          pageCorrectness[i] = correctness[gi] ?? null;
        }

        return (
          <div
            key={pageIdx}
            className="h-screen flex flex-col bg-white rounded-lg shadow-lg mb-2 sm:mb-4 print:block print:h-[198mm] print:w-full print:overflow-hidden print:shadow-none print:mb-0 print:rounded-none"
            style={{
              breakInside: "avoid",
              pageBreakInside: "avoid",
              ...(pageIdx < pageCount - 1
                ? { pageBreakAfter: "always", breakAfter: "page" }
                : {}),
            }}
          >
            <div className="flex-1 flex flex-col gap-2 sm:gap-4 py-2 sm:py-4 min-h-0 print:flex print:flex-col print:h-full print:gap-4 print:py-2 print:min-h-0">
              <TestGrid
                questions={pageQs.map((q) => q.question)}
                questionTypes={pageQs.map((q) => q.type)}
                answers={pageAnswers}
                onAnswerChange={(localIdx, value) =>
                  handleAnswerChange(start + localIdx, value)
                }
                formatQuestion={formatQuestion}
                onQuestionClick={(localIdx) =>
                  handleQuestionClick(start + localIdx)
                }
                correctness={pageCorrectness}
                onMarkCorrect={(localIdx) =>
                  handleMarkCorrect(start + localIdx)
                }
                onMarkIncorrect={(localIdx) =>
                  handleMarkIncorrect(start + localIdx)
                }
              />
            </div>
          </div>
        );
      })}

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

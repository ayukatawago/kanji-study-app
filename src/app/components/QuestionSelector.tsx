"use client";

import { useState, useEffect, useMemo } from "react";
import ReviewStats from "./ReviewStats";
import { recordReview, getRecommendedQuestions } from "@/lib/fsrsScheduler";
import {
  getExcludedQuestions,
  toggleExcludedQuestion,
  getAllCards,
  KanjiCard,
} from "@/lib/fsrsStorage";
import { Rating, State } from "ts-fsrs";
import {
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  NoSymbolIcon,
  TableCellsIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/solid";

const FSRS_OPTIONS = { maxReviews: 30, maxNew: 30, totalLimit: 30 } as const;

interface Question {
  id: number;
  question: string;
  answer: string;
  group: number;
}

type TestMode = "grid" | "flashcard";

interface QuestionSelectorProps {
  questions: Question[];
  selectedQuestions: Set<number>;
  onSetQuestions: (questionIds: number[]) => void;
  onStartTest: () => void;
  currentGrade: number;
  onGradeChange: (grade: number) => void;
  testMode: TestMode;
  onTestModeChange: (mode: TestMode) => void;
}

export default function QuestionSelector({
  questions,
  selectedQuestions,
  onSetQuestions,
  onStartTest,
  currentGrade,
  onGradeChange,
  testMode,
  onTestModeChange,
}: QuestionSelectorProps) {
  const [excludedQuestions, setExcludedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [allCards, setAllCards] = useState<Record<string, KanjiCard>>(() =>
    getAllCards()
  );

  useEffect(() => {
    const excluded = getExcludedQuestions(currentGrade);
    setExcludedQuestions(excluded);
  }, [currentGrade]);

  const refreshFsrsSelection = (excluded: Set<number>) => {
    const ids = questions
      .filter((q) => !excluded.has(q.id))
      .filter((q) => selectedGroup === null || q.group === selectedGroup)
      .map((q) => q.id);
    onSetQuestions(getRecommendedQuestions(ids, currentGrade, FSRS_OPTIONS));
  };

  const handleToggleExclude = (questionId: number) => {
    toggleExcludedQuestion(questionId, currentGrade);
    const excluded = getExcludedQuestions(currentGrade);
    setExcludedQuestions(excluded);

    refreshFsrsSelection(excluded);
  };

  const handleRecordReview = (questionId: number, isCorrect: boolean) => {
    const rating = isCorrect ? Rating.Good : Rating.Again;
    recordReview(questionId, currentGrade, rating, isCorrect);

    setAllCards(getAllCards());
    refreshFsrsSelection(getExcludedQuestions(currentGrade));
  };

  const getFsrsLabel = (
    questionId: number
  ): { text: string; className: string } => {
    const key = `${currentGrade}-${questionId}`;
    const kanjiCard = allCards[key];

    if (!kanjiCard || kanjiCard.card.state === State.New) {
      return { text: "NEW", className: "bg-blue-100 text-blue-600" };
    }

    const now = new Date();
    const dueDate = new Date(kanjiCard.card.due);

    if (dueDate <= now) {
      return { text: "要復習", className: "bg-orange-100 text-orange-600" };
    }

    const daysUntil = Math.ceil(
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      text: `${daysUntil}日後`,
      className: "bg-green-100 text-green-600",
    };
  };

  useEffect(() => {
    setSelectedGroup(null);
  }, [currentGrade]);

  useEffect(() => {
    if (questions.length > 0) {
      const excluded = getExcludedQuestions(currentGrade);
      const ids = questions
        .filter((q) => !excluded.has(q.id))
        .filter((q) => selectedGroup === null || q.group === selectedGroup)
        .map((q) => q.id);
      onSetQuestions(getRecommendedQuestions(ids, currentGrade, FSRS_OPTIONS));
    }
  }, [currentGrade, questions, selectedGroup, onSetQuestions]);

  const selectedArray = Array.from(selectedQuestions);
  const actualSelectedCount = selectedArray.filter(
    (id) => !excludedQuestions.has(id)
  ).length;

  const allGroups = useMemo(
    () => [...new Set(questions.map((q) => q.group))].sort((a, b) => a - b),
    [questions]
  );
  const visibleQuestions =
    selectedGroup === null
      ? questions
      : questions.filter((q) => q.group === selectedGroup);

  return (
    <div className="max-w-6xl mx-auto px-3 py-4 sm:px-4 sm:py-8">
      {/* Review Statistics */}
      <ReviewStats currentGrade={currentGrade} />

      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <div className="mb-4 space-y-3">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-800">
              漢字テスト - 問題選択
            </h1>
            <p className="text-gray-600 mt-1">
              テストする問題を選択してください（{actualSelectedCount}問選択中）
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* Grade Select */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="grade-select"
                className="text-sm font-medium text-gray-700"
              >
                学年:
              </label>
              <select
                id="grade-select"
                value={currentGrade}
                onChange={(e) => onGradeChange(Number(e.target.value))}
                className="border-2 border-blue-400 rounded-md px-3 py-2 text-sm font-semibold bg-blue-50 text-blue-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
              >
                <option value={3}>3年生</option>
                <option value={6}>6年生</option>
                <option value={7}>中1</option>
              </select>
            </div>

            {/* Group Select */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="group-select"
                className="text-sm font-medium text-gray-700"
              >
                グループ:
              </label>
              <select
                id="group-select"
                value={selectedGroup ?? ""}
                onChange={(e) =>
                  setSelectedGroup(
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
                className="border-2 border-gray-400 rounded-md px-3 py-2 text-sm font-semibold bg-gray-50 text-gray-800 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm"
              >
                <option value="">すべて</option>
                {allGroups.map((g) => (
                  <option key={g} value={g}>
                    グループ {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action bar: select controls + test format + start */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* テスト形式 toggle — desktop only; mobile always uses flashcard */}
          <div className="hidden sm:flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              テスト形式:
            </label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onTestModeChange("grid")}
                className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  testMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <TableCellsIcon className="w-4 h-4" />
                一覧
              </button>
              <button
                onClick={() => onTestModeChange("flashcard")}
                className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  testMode === "flashcard"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <RectangleStackIcon className="w-4 h-4" />
                フラッシュカード
              </button>
            </div>
          </div>

          <button
            onClick={onStartTest}
            disabled={actualSelectedCount === 0}
            className="ml-auto flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-sm"
          >
            <PlayIcon className="w-4 h-4" />
            テスト開始 ({actualSelectedCount}問)
          </button>
        </div>

        {/* Question groups */}
        <div className="space-y-6">
          {allGroups
            .filter((g) => selectedGroup === null || g === selectedGroup)
            .map((groupNumber) => {
              const groupQs = visibleQuestions.filter(
                (q) => q.group === groupNumber
              );
              if (groupQs.length === 0) return null;

              return (
                <div
                  key={groupNumber}
                  className="border border-gray-200 rounded-lg p-3 sm:p-4"
                >
                  <div className="mb-3">
                    <h2 className="text-xl font-semibold text-gray-700">
                      グループ {groupNumber}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {groupQs.map((q) => {
                      const isExcluded = excludedQuestions.has(q.id);
                      return (
                        <div
                          key={q.id}
                          className={`px-3 py-2 sm:p-3 rounded-md border-2 ${
                            isExcluded
                              ? "bg-red-50 border-red-300 opacity-60"
                              : selectedQuestions.has(q.id)
                                ? "bg-purple-50 border-purple-400"
                                : "bg-gray-50 border-gray-200 opacity-50"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className={`text-sm font-bold min-w-[2rem] ${
                                selectedQuestions.has(q.id) && !isExcluded
                                  ? "text-blue-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {q.id}.
                            </span>
                            <div className="flex-1 text-left">
                              <div className="text-lg font-bold text-gray-800 mb-1">
                                {q.answer}
                              </div>
                              <div className="hidden sm:block text-sm text-gray-600">
                                {q.question}
                              </div>
                              {(() => {
                                const label = getFsrsLabel(q.id);
                                return (
                                  <span
                                    className={`inline-block mt-1 px-1.5 py-0.5 rounded text-xs font-medium ${label.className}`}
                                  >
                                    {label.text}
                                  </span>
                                );
                              })()}
                            </div>
                            <div className="hidden sm:flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRecordReview(q.id, true);
                                }}
                                disabled={isExcluded}
                                className="w-7 h-7 rounded-full flex items-center justify-center bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="正解として記録"
                                title="正解として記録"
                              >
                                <CheckCircleIcon className="w-5 h-5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRecordReview(q.id, false);
                                }}
                                disabled={isExcluded}
                                className="w-7 h-7 rounded-full flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="不正解として記録"
                                title="不正解として記録"
                              >
                                <XCircleIcon className="w-5 h-5" />
                              </button>
                            </div>
                            <label
                              className="flex items-center gap-1 cursor-pointer"
                              title="除外"
                            >
                              <input
                                type="checkbox"
                                checked={isExcluded}
                                onChange={() => handleToggleExclude(q.id)}
                                className="sr-only"
                              />
                              <NoSymbolIcon
                                className={`w-5 h-5 transition-colors ${isExcluded ? "text-red-500" : "text-gray-300 hover:text-red-400"}`}
                              />
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

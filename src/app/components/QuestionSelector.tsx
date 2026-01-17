"use client";

import { useState, useEffect } from "react";
import ReviewStats from "./ReviewStats";
import { getRecommendedQuestions } from "@/lib/fsrsScheduler";
import {
  getExcludedQuestions,
  toggleExcludedQuestion,
} from "@/lib/fsrsStorage";

interface Question {
  id: number;
  question: string;
  answer: string;
}

interface QuestionSelectorProps {
  questions: Question[];
  selectedQuestions: Set<number>;
  onToggleQuestion: (questionId: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSetQuestions: (questionIds: number[]) => void;
  onStartTest: () => void;
  currentGrade: number;
  onGradeChange: (grade: number) => void;
}

type SelectionMode = "manual" | "fsrs";

export default function QuestionSelector({
  questions,
  selectedQuestions,
  onToggleQuestion,
  onSelectAll,
  onDeselectAll,
  onSetQuestions,
  onStartTest,
  currentGrade,
  onGradeChange,
}: QuestionSelectorProps) {
  const [mode, setMode] = useState<SelectionMode>("fsrs");
  const [excludedQuestions, setExcludedQuestions] = useState<Set<number>>(
    new Set()
  );

  // Load mode preference and excluded questions from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem("selectionMode") as SelectionMode;
    if (savedMode === "fsrs" || savedMode === "manual") {
      setMode(savedMode);
    } else {
      // If no saved mode, set default to FSRS
      localStorage.setItem("selectionMode", "fsrs");
    }

    // Load excluded questions for current grade
    const excluded = getExcludedQuestions(currentGrade);
    setExcludedQuestions(excluded);
  }, [currentGrade]);

  // Handle mode change
  const handleModeChange = (newMode: SelectionMode) => {
    setMode(newMode);
    localStorage.setItem("selectionMode", newMode);

    if (newMode === "fsrs") {
      // Auto-select FSRS recommended questions (excluding excluded ones)
      const allQuestionIds = questions
        .filter((q) => !excludedQuestions.has(q.id))
        .map((q) => q.id);
      const recommended = getRecommendedQuestions(
        allQuestionIds,
        currentGrade,
        {
          maxReviews: 20,
          maxNew: 10,
          totalLimit: 30,
        }
      );

      // Directly set the recommended questions
      onSetQuestions(recommended);
    }
  };

  // Handle exclude toggle
  const handleToggleExclude = (questionId: number) => {
    toggleExcludedQuestion(questionId, currentGrade);
    const excluded = getExcludedQuestions(currentGrade);
    setExcludedQuestions(excluded);

    // If question is now excluded, remove it from selection
    if (excluded.has(questionId) && selectedQuestions.has(questionId)) {
      onToggleQuestion(questionId);
    }

    // If in FSRS mode, recalculate recommendations
    if (mode === "fsrs") {
      const allQuestionIds = questions
        .filter((q) => !excluded.has(q.id))
        .map((q) => q.id);
      const recommended = getRecommendedQuestions(
        allQuestionIds,
        currentGrade,
        {
          maxReviews: 20,
          maxNew: 10,
          totalLimit: 30,
        }
      );
      onSetQuestions(recommended);
    }
  };

  // Re-select FSRS questions when grade changes in FSRS mode or when questions load
  useEffect(() => {
    if (mode === "fsrs" && questions.length > 0) {
      const allQuestionIds = questions
        .filter((q) => !excludedQuestions.has(q.id))
        .map((q) => q.id);
      const recommended = getRecommendedQuestions(
        allQuestionIds,
        currentGrade,
        {
          maxReviews: 20,
          maxNew: 10,
          totalLimit: 30,
        }
      );

      // Only update selection if it's different from current
      const currentSelection = Array.from(selectedQuestions).sort(
        (a, b) => a - b
      );
      const newSelection = [...recommended].sort((a, b) => a - b);

      const isDifferent =
        currentSelection.length !== newSelection.length ||
        currentSelection.some((id, idx) => id !== newSelection[idx]);

      if (isDifferent) {
        // Directly set the recommended questions
        onSetQuestions(recommended);
      }
    }
  }, [currentGrade, mode, questions, excludedQuestions]);
  // Group questions by test (10 questions per test)
  const testsCount = Math.ceil(questions.length / 10);
  const tests = Array.from({ length: testsCount }, (_, i) => i + 1);

  const isTestFullySelected = (testNumber: number) => {
    const startId = (testNumber - 1) * 10 + 1;
    const endId = Math.min(testNumber * 10, questions.length);
    for (let id = startId; id <= endId; id++) {
      if (!selectedQuestions.has(id)) return false;
    }
    return true;
  };

  const toggleTest = (testNumber: number) => {
    const startId = (testNumber - 1) * 10 + 1;
    const endId = Math.min(testNumber * 10, questions.length);
    const isFullySelected = isTestFullySelected(testNumber);

    for (let id = startId; id <= endId; id++) {
      if (isFullySelected && selectedQuestions.has(id)) {
        onToggleQuestion(id);
      } else if (!isFullySelected && !selectedQuestions.has(id)) {
        onToggleQuestion(id);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Review Statistics */}
      <ReviewStats currentGrade={currentGrade} />

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">
              漢字テスト - 問題選択
            </h1>
            <p className="text-gray-600 mt-2">
              テストする問題を選択してください（{selectedQuestions.size}
              問選択中）
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Mode Toggle */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                選択モード:
              </label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleModeChange("manual")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    mode === "manual"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  手動選択
                </button>
                <button
                  onClick={() => handleModeChange("fsrs")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    mode === "fsrs"
                      ? "bg-white text-purple-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  FSRS自動
                </button>
              </div>
            </div>

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
              </select>
            </div>
          </div>
        </div>

        {/* Mode Description */}
        {mode === "fsrs" && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              <span className="font-semibold">FSRSモード:</span>{" "}
              復習が必要な問題と新規問題を自動的に選択します。問題は学習状況に基づいて最適化されています。
            </p>
          </div>
        )}

        {/* Control buttons */}
        <div className="flex gap-3 mb-6 flex-wrap justify-center">
          <button
            onClick={onSelectAll}
            disabled={mode === "fsrs"}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            すべて選択
          </button>
          <button
            onClick={onDeselectAll}
            disabled={mode === "fsrs"}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            すべて解除
          </button>
          <button
            onClick={onStartTest}
            disabled={selectedQuestions.size === 0}
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
          >
            テスト開始 ({selectedQuestions.size}問)
          </button>
        </div>

        {/* Test groups */}
        <div className="space-y-6">
          {tests.map((testNumber) => {
            const startIdx = (testNumber - 1) * 10;
            const endIdx = Math.min(testNumber * 10, questions.length);
            const testQuestions = questions.slice(startIdx, endIdx);

            return (
              <div
                key={testNumber}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold text-gray-700">
                    テスト {testNumber} （問題 {startIdx + 1}～{endIdx}）
                  </h2>
                  <button
                    onClick={() => toggleTest(testNumber)}
                    disabled={mode === "fsrs"}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      mode === "fsrs"
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : isTestFullySelected(testNumber)
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {isTestFullySelected(testNumber) ? "解除" : "選択"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {testQuestions.map((q) => {
                    const isExcluded = excludedQuestions.has(q.id);
                    return (
                      <div
                        key={q.id}
                        className={`p-3 rounded-md border-2 ${
                          isExcluded
                            ? "bg-red-50 border-red-300 opacity-60"
                            : mode === "fsrs"
                              ? selectedQuestions.has(q.id)
                                ? "bg-purple-50 border-purple-400"
                                : "bg-gray-50 border-gray-200 opacity-50"
                              : selectedQuestions.has(q.id)
                                ? "bg-blue-50 border-blue-500"
                                : "bg-gray-50 border-gray-200"
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
                          <button
                            onClick={() =>
                              mode === "manual" &&
                              !isExcluded &&
                              onToggleQuestion(q.id)
                            }
                            disabled={mode === "fsrs" || isExcluded}
                            className="flex-1 text-left"
                          >
                            <div className="text-lg font-bold text-gray-800 mb-1">
                              {q.answer}
                            </div>
                            <div className="text-sm text-gray-600">
                              {q.question}
                            </div>
                          </button>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isExcluded}
                              onChange={() => handleToggleExclude(q.id)}
                              className="w-4 h-4 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                            />
                            <span className="text-xs text-gray-600">除外</span>
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

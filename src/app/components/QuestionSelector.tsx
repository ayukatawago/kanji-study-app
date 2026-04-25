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
  group: number;
}

type TestMode = "grid" | "flashcard";

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
  testMode: TestMode;
  onTestModeChange: (mode: TestMode) => void;
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
  testMode,
  onTestModeChange,
}: QuestionSelectorProps) {
  const [mode, setMode] = useState<SelectionMode>("fsrs");
  const [excludedQuestions, setExcludedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

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
          maxReviews: 15,
          maxNew: 30,
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
          maxReviews: 15,
          maxNew: 30,
          totalLimit: 30,
        }
      );
      onSetQuestions(recommended);
    }
  };

  // Reset group filter when grade changes
  useEffect(() => {
    setSelectedGroup(null);
  }, [currentGrade]);

  // Re-select FSRS questions when grade changes in FSRS mode or when questions load
  useEffect(() => {
    if (mode === "fsrs" && questions.length > 0) {
      // Read excluded questions directly from localStorage to avoid state timing issues
      const currentExcluded = getExcludedQuestions(currentGrade);

      const allQuestionIds = questions
        .filter((q) => !currentExcluded.has(q.id))
        .filter((q) => selectedGroup === null || q.group === selectedGroup)
        .map((q) => q.id);

      console.log(
        "useEffect: Filtering out",
        currentExcluded.size,
        "excluded questions"
      );
      console.log("useEffect: Available questions:", allQuestionIds.length);

      const recommended = getRecommendedQuestions(
        allQuestionIds,
        currentGrade,
        {
          maxReviews: 15,
          maxNew: 30,
          totalLimit: 30,
        }
      );

      console.log("useEffect: Got", recommended.length, "recommendations");

      // Verify none of the recommended questions are excluded
      const problematicQuestions = recommended.filter((id) =>
        currentExcluded.has(id)
      );
      if (problematicQuestions.length > 0) {
        console.error(
          "BUG: Recommended questions contain excluded items:",
          problematicQuestions
        );
      }

      // Always update (removed comparison logic that might cause stale data)
      onSetQuestions(recommended);
    }
  }, [
    currentGrade,
    mode,
    questions,
    excludedQuestions,
    selectedGroup,
    onSetQuestions,
  ]);

  // Calculate actual selected count (excluding excluded questions)
  const selectedArray = Array.from(selectedQuestions);
  const filteredSelected = selectedArray.filter(
    (id) => !excludedQuestions.has(id)
  );

  // Debug: Check if any excluded questions are in selection
  const excludedInSelection = selectedArray.filter((id) =>
    excludedQuestions.has(id)
  );
  if (excludedInSelection.length > 0) {
    console.log(
      "WARNING: Excluded questions in selection:",
      excludedInSelection
    );
    console.log("Total selected:", selectedArray.length);
    console.log("After filtering excluded:", filteredSelected.length);
  }

  const actualSelectedCount = filteredSelected.length;

  // Derive groups from data and apply group filter
  const allGroups = [...new Set(questions.map((q) => q.group))].sort(
    (a, b) => a - b
  );
  const visibleQuestions =
    selectedGroup === null
      ? questions
      : questions.filter((q) => q.group === selectedGroup);

  const isGroupFullySelected = (groupNumber: number) => {
    const groupIds = questions
      .filter((q) => q.group === groupNumber)
      .map((q) => q.id);
    return groupIds.every((id) => selectedQuestions.has(id));
  };

  const toggleGroup = (groupNumber: number) => {
    const groupIds = questions
      .filter((q) => q.group === groupNumber)
      .map((q) => q.id);
    const isFullySelected = isGroupFullySelected(groupNumber);
    for (const id of groupIds) {
      if (isFullySelected && selectedQuestions.has(id)) {
        onToggleQuestion(id);
      } else if (!isFullySelected && !selectedQuestions.has(id)) {
        onToggleQuestion(id);
      }
    }
  };

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

        {/* Mode Description — hidden on mobile */}
        {mode === "fsrs" && (
          <div className="hidden sm:block mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-800">
              <span className="font-semibold">FSRSモード:</span>{" "}
              復習が必要な問題と新規問題を自動的に選択します。問題は学習状況に基づいて最適化されています。
            </p>
          </div>
        )}

        {/* Action bar: select controls + test format + start */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={onSelectAll}
            disabled={mode === "fsrs"}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
          >
            すべて選択
          </button>
          <button
            onClick={onDeselectAll}
            disabled={mode === "fsrs"}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
          >
            すべて解除
          </button>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              テスト形式:
            </label>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onTestModeChange("grid")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  testMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                一覧
              </button>
              <button
                onClick={() => onTestModeChange("flashcard")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  testMode === "flashcard"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                フラッシュカード
              </button>
            </div>
          </div>

          <button
            onClick={onStartTest}
            disabled={actualSelectedCount === 0}
            className="ml-auto px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-sm"
          >
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
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-semibold text-gray-700">
                      グループ {groupNumber}
                    </h2>
                    <button
                      onClick={() => toggleGroup(groupNumber)}
                      disabled={mode === "fsrs"}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        mode === "fsrs"
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : isGroupFullySelected(groupNumber)
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      {isGroupFullySelected(groupNumber) ? "解除" : "選択"}
                    </button>
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
                              <div className="hidden sm:block text-sm text-gray-600">
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
                              <span className="text-xs text-gray-600">
                                除外
                              </span>
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

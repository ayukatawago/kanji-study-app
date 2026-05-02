"use client";

import { useState, useEffect } from "react";
import {
  XCircleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
} from "@heroicons/react/24/solid";

interface FlashCardProps {
  question: string;
  answer: string;
  questionType?: string;
  currentIndex: number;
  totalCount: number;
  isCorrect: boolean | null;
  onMarkCorrect: () => void;
  onMarkIncorrect: () => void;
  onNext: () => void;
  onPrev: () => void;
  onBackToSelector?: () => void;
  formatQuestion: (text: string) => string;
}

export default function FlashCard({
  question,
  answer,
  questionType,
  currentIndex,
  totalCount,
  isCorrect,
  onMarkCorrect,
  onMarkIncorrect,
  onNext,
  onPrev,
  onBackToSelector,
  formatQuestion,
}: FlashCardProps) {
  const [revealed, setRevealed] = useState(false);

  // Reset revealed state when the card changes
  useEffect(() => {
    setRevealed(false);
  }, [currentIndex]);

  const handleMarkCorrect = () => {
    onMarkCorrect();
    onNext();
  };

  const handleMarkIncorrect = () => {
    onMarkIncorrect();
    onNext();
  };

  const progressPercent = Math.round(((currentIndex + 1) / totalCount) * 100);

  return (
    <div className="h-screen flex flex-col max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between py-3 flex-shrink-0">
        {onBackToSelector && (
          <button
            onClick={onBackToSelector}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded transition-colors text-sm"
          >
            ← 選択画面
          </button>
        )}
        <h1 className="text-xl font-bold text-gray-900">フラッシュカード</h1>
        <span className="text-sm font-medium text-gray-600">
          {currentIndex + 1} / {totalCount}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-4 flex-shrink-0">
        <div
          className="h-2 bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col min-h-0 mb-4">
        <div
          className={`flex-1 bg-white rounded-2xl shadow-lg flex flex-col overflow-hidden transition-colors ${
            !revealed ? "cursor-pointer hover:bg-blue-50" : ""
          } ${
            isCorrect === true
              ? "ring-4 ring-green-400"
              : isCorrect === false
                ? "ring-4 ring-red-400"
                : ""
          }`}
          onClick={() => !revealed && setRevealed(true)}
        >
          {/* Top half — question (always in same position) */}
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8">
            {questionType === "antonym" && (
              <div className="text-sm font-medium text-orange-700 bg-orange-100 rounded px-2 py-1">
                対義語
              </div>
            )}
            <div
              className="text-2xl leading-relaxed font-medium text-gray-900 text-center"
              style={{
                fontFamily:
                  "'Noto Serif JP', 'Yu Mincho', 'YuMincho', 'Hiragino Mincho Pro', serif",
              }}
              dangerouslySetInnerHTML={{ __html: formatQuestion(question) }}
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200 mx-8" />

          {/* Bottom half — answer or hint (same height always) */}
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            {revealed ? (
              <>
                <p className="text-sm text-gray-500 mb-2">答え</p>
                <p className="text-4xl font-bold text-blue-700">{answer}</p>
              </>
            ) : (
              <p className="text-sm text-gray-400">タップして答えを見る</p>
            )}
          </div>
        </div>
      </div>

      {/* Correctness buttons — always rendered to hold space, hidden when not revealed */}
      <div
        className="flex gap-4 justify-center mb-2 sm:mb-4 flex-shrink-0"
        style={{ visibility: revealed ? "visible" : "hidden" }}
      >
        <button
          onClick={handleMarkIncorrect}
          className="flex-1 max-w-40 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-colors bg-red-100 text-red-600 hover:bg-red-500 hover:text-white"
        >
          <XCircleIcon className="w-6 h-6" />
          不正解
        </button>
        <button
          onClick={handleMarkCorrect}
          className="flex-1 max-w-40 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-colors bg-green-100 text-green-600 hover:bg-green-500 hover:text-white"
        >
          <CheckCircleIcon className="w-6 h-6" />
          正解
        </button>
      </div>

      {/* Navigation — always rendered to hold space */}
      <div className="flex gap-3 justify-center mb-3 sm:mb-6 flex-shrink-0">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 px-6 py-2 rounded-lg font-medium text-sm transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          前へ
        </button>
        <button
          onClick={() => setRevealed(true)}
          className="flex items-center gap-1 px-6 py-2 rounded-lg font-medium text-sm transition-colors bg-blue-600 text-white hover:bg-blue-700"
          style={{ visibility: revealed ? "hidden" : "visible" }}
        >
          <EyeIcon className="w-4 h-4" />
          答えを見る
        </button>
        <button
          onClick={onNext}
          disabled={currentIndex === totalCount - 1}
          className="flex items-center gap-1 px-6 py-2 rounded-lg font-medium text-sm transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          次へ
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

"use client";

import ReviewStats from "./ReviewStats";

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
  onStartTest: () => void;
  currentGrade: number;
  onGradeChange: (grade: number) => void;
}

export default function QuestionSelector({
  questions,
  selectedQuestions,
  onToggleQuestion,
  onSelectAll,
  onDeselectAll,
  onStartTest,
  currentGrade,
  onGradeChange,
}: QuestionSelectorProps) {
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
              テストする問題を選択してください（{selectedQuestions.size}問選択中）
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="grade-select" className="text-sm font-medium text-gray-700">
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

        {/* Control buttons */}
        <div className="flex gap-3 mb-6 flex-wrap justify-center">
          <button
            onClick={onSelectAll}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            すべて選択
          </button>
          <button
            onClick={onDeselectAll}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
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
              <div key={testNumber} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold text-gray-700">
                    テスト {testNumber} （問題 {startIdx + 1}～{endIdx}）
                  </h2>
                  <button
                    onClick={() => toggleTest(testNumber)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      isTestFullySelected(testNumber)
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {isTestFullySelected(testNumber) ? "解除" : "選択"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {testQuestions.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => onToggleQuestion(q.id)}
                      className={`p-3 rounded-md text-left transition-colors border-2 ${
                        selectedQuestions.has(q.id)
                          ? "bg-blue-50 border-blue-500 hover:bg-blue-100"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`text-sm font-bold min-w-[2rem] ${
                          selectedQuestions.has(q.id) ? "text-blue-600" : "text-gray-500"
                        }`}>
                          {q.id}.
                        </span>
                        <div className="flex-1">
                          <div className="text-lg font-bold text-gray-800 mb-1">
                            {q.answer}
                          </div>
                          <div className="text-sm text-gray-600">
                            {q.question}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

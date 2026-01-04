interface Question {
  id: number;
  question: string;
  answer: string;
}

interface HeaderProps {
  testData: { questions: Question[] } | null;
  selectedTestId: number;
  onTestChange: (testId: number) => void;
  onPrint: () => void;
  onBackToSelector?: () => void;
  showAnswers?: boolean;
  onToggleAnswers?: () => void;
}

export default function Header({
  testData,
  selectedTestId,
  onTestChange,
  onPrint,
  onBackToSelector,
  showAnswers,
  onToggleAnswers,
}: HeaderProps) {
  return (
    <div className="flex justify-between items-center my-4 flex-shrink-0">
      <div className="flex items-center gap-2">
        {onBackToSelector && (
          <button
            onClick={onBackToSelector}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded transition-colors text-sm"
            title="問題選択に戻る"
          >
            ← 選択画面
          </button>
        )}
        <label
          htmlFor="test-select"
          className="text-sm font-medium text-gray-700"
        >
          テスト:
        </label>
        <select
          id="test-select"
          value={selectedTestId}
          onChange={(e) => onTestChange(Number(e.target.value))}
          className="border-2 border-blue-400 rounded-md px-3 py-1 text-sm font-semibold bg-blue-50 text-blue-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
        >
          {testData &&
            Array.from(
              { length: Math.ceil(testData.questions.length / 10) },
              (_, i) => (
                <option key={i + 1} value={i + 1}>
                  テスト {i + 1}
                </option>
              )
            )}
        </select>
      </div>
      <h1 className="text-xl font-bold text-center text-gray-900">
        漢字テスト
      </h1>
      <div className="flex items-center gap-2">
        {onToggleAnswers && (
          <button
            onClick={onToggleAnswers}
            className={`font-bold py-2 px-3 rounded transition-colors text-sm ${
              showAnswers
                ? "bg-orange-600 hover:bg-orange-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            title={showAnswers ? "答えを隠す" : "答えを表示"}
          >
            {showAnswers ? "答えを隠す" : "答えを表示"}
          </button>
        )}
        <button
          onClick={onPrint}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-2 rounded transition-colors"
          title="印刷"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

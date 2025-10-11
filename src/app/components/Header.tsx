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
  onSettingsClick: () => void;
}

export default function Header({ testData, selectedTestId, onTestChange, onPrint, onSettingsClick }: HeaderProps) {
  return (
    <div className="flex justify-between items-center my-4 flex-shrink-0">
      <div className="flex items-center gap-2">
        <label htmlFor="test-select" className="text-sm font-medium text-gray-700">テスト:</label>
        <select
          id="test-select"
          value={selectedTestId}
          onChange={(e) => onTestChange(Number(e.target.value))}
          className="border-2 border-blue-400 rounded-md px-3 py-1 text-sm font-semibold bg-blue-50 text-blue-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
        >
          {testData && Array.from({ length: Math.ceil(testData.questions.length / 10) }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              テスト {i + 1}
            </option>
          ))}
        </select>
      </div>
      <h1 className="text-xl font-bold text-center text-gray-900">
        漢字テスト
      </h1>
      <div className="flex items-center gap-2">
        <button
          onClick={onSettingsClick}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-1 px-3 rounded text-xs transition-colors"
        >
          設定
        </button>
        <button
          onClick={onPrint}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs transition-colors"
        >
          印刷
        </button>
      </div>
    </div>
  );
}
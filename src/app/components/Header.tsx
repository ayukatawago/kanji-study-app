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
          onClick={onPrint}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-2 rounded transition-colors"
          title="印刷"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
        </button>
        <button
          onClick={onSettingsClick}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-2 rounded transition-colors"
          title="設定"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
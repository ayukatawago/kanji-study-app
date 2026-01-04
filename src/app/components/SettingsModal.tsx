interface SettingsModalProps {
  currentDataSource: string;
  onDataSourceChange: (dataSource: string) => void;
  onClose: () => void;
}

export default function SettingsModal({
  currentDataSource,
  onDataSourceChange,
  onClose,
}: SettingsModalProps) {
  const dataSources = [
    { key: "kanji_grade3.json", label: "3年生漢字テスト" },
    { key: "kanji_grade6.json", label: "6年生漢字テスト" },
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">設定</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-800 mb-3">
            データソース
          </h4>
          <div className="space-y-2">
            {dataSources.map((source) => (
              <label
                key={source.key}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name="dataSource"
                  value={source.key}
                  checked={currentDataSource === source.key}
                  onChange={(e) => onDataSourceChange(e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-700">{source.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

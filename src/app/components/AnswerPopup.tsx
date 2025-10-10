interface AnswerPopupProps {
  questionIndex: number;
  answer: string;
  onClose: () => void;
}

export default function AnswerPopup({ questionIndex, answer, onClose }: AnswerPopupProps) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-md w-max shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            問題 {questionIndex + 1} の答え
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="text-center">
          <p className="text-2xl font-medium text-gray-900 p-4 bg-gray-50 rounded">
            {answer}
          </p>
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
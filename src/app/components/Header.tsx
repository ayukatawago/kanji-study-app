import {
  PrinterIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/solid";

interface HeaderProps {
  onPrint: () => void;
  onBackToSelector?: () => void;
  showAnswers?: boolean;
  onToggleAnswers?: () => void;
}

export default function Header({
  onPrint,
  onBackToSelector,
  showAnswers,
  onToggleAnswers,
}: HeaderProps) {
  return (
    <div className="flex justify-between items-center my-2 sm:my-4 flex-shrink-0">
      <div className="flex items-center gap-2">
        {onBackToSelector && (
          <button
            onClick={onBackToSelector}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded transition-colors text-sm"
            title="問題選択に戻る"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            選択画面
          </button>
        )}
      </div>
      <h1 className="text-base sm:text-xl font-bold text-center text-gray-900 truncate px-2">
        漢字テスト
      </h1>
      <div className="flex items-center gap-2">
        {onToggleAnswers && (
          <button
            onClick={onToggleAnswers}
            className={`flex items-center gap-1 font-bold py-2 px-3 rounded transition-colors text-sm ${
              showAnswers
                ? "bg-orange-600 hover:bg-orange-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            title={showAnswers ? "答えを隠す" : "答えを表示"}
          >
            {showAnswers ? (
              <>
                <EyeSlashIcon className="w-4 h-4" />
                答えを隠す
              </>
            ) : (
              <>
                <EyeIcon className="w-4 h-4" />
                答えを表示
              </>
            )}
          </button>
        )}
        <button
          onClick={onPrint}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-2 rounded transition-colors"
          title="印刷"
        >
          <PrinterIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

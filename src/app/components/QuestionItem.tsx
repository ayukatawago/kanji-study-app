import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import AnswerBox from "./AnswerBox";
import Question from "./Question";

interface QuestionItemProps {
  questionNumber: number;
  questionText: string;
  questionType?: string;
  answer: string;
  onAnswerChange: (value: string) => void;
  formatQuestion: (text: string) => string;
  onQuestionClick?: () => void;
  isCorrect?: boolean | null;
  onMarkCorrect?: () => void;
  onMarkIncorrect?: () => void;
}

export default function QuestionItem({
  questionNumber,
  questionText,
  questionType,
  answer,
  onAnswerChange,
  formatQuestion,
  onQuestionClick,
  isCorrect,
  onMarkCorrect,
  onMarkIncorrect,
}: QuestionItemProps) {
  return (
    <div className="flex flex-col items-center gap-1 sm:gap-2 h-full min-h-0">
      {/* Question number */}
      <div className="text-md font-bold text-gray-800 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
        {questionNumber}
      </div>
      {questionType === "antonym" && (
        <div className="text-xs font-medium text-orange-700 bg-orange-100 rounded px-1 py-0.5 flex-shrink-0 print:text-black print:bg-transparent">
          対義語
        </div>
      )}

      <div className="flex items-start gap-2 sm:gap-4 flex-1 h-full min-h-0">
        <AnswerBox answer={answer} onAnswerChange={onAnswerChange} />
        <Question
          questionText={questionText}
          formatQuestion={formatQuestion}
          onQuestionClick={onQuestionClick}
        />
      </div>

      {/* Correctness marking buttons */}
      {onMarkCorrect && onMarkIncorrect && (
        <div className="flex gap-2 flex-shrink-0 print:hidden">
          <button
            onClick={onMarkCorrect}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center transition-colors ${
              isCorrect === true
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600"
            }`}
            title="正解"
          >
            <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={onMarkIncorrect}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center transition-colors ${
              isCorrect === false
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600"
            }`}
            title="不正解"
          >
            <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

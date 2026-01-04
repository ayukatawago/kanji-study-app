import AnswerBox from "./AnswerBox";
import Question from "./Question";

interface QuestionItemProps {
  questionNumber: number;
  questionText: string;
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
  answer,
  onAnswerChange,
  formatQuestion,
  onQuestionClick,
  isCorrect,
  onMarkCorrect,
  onMarkIncorrect,
}: QuestionItemProps) {
  return (
    <div className="flex flex-col items-center gap-2 h-full min-h-0">
      {/* Question number */}
      <div className="text-md font-bold text-gray-800 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
        {questionNumber}
      </div>

      <div className="flex items-start gap-4 flex-1 h-full min-h-0">
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
            className={`w-8 h-8 rounded-md font-bold text-lg transition-colors ${
              isCorrect === true
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600"
            }`}
            title="正解"
          >
            ✓
          </button>
          <button
            onClick={onMarkIncorrect}
            className={`w-8 h-8 rounded-md font-bold text-lg transition-colors ${
              isCorrect === false
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600"
            }`}
            title="不正解"
          >
            ✗
          </button>
        </div>
      )}
    </div>
  );
}

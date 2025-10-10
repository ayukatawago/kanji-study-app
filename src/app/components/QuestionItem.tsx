import AnswerBox from "./AnswerBox";
import Question from "./Question";

interface QuestionItemProps {
  questionNumber: number;
  questionText: string;
  answer: string;
  onAnswerChange: (value: string) => void;
  formatQuestion: (text: string) => string;
  onQuestionClick?: () => void;
}

export default function QuestionItem({ questionNumber, questionText, answer, onAnswerChange, formatQuestion, onQuestionClick }: QuestionItemProps) {
  return (
    <div className="flex flex-col items-center gap-2 h-full min-h-0">
      {/* Question number */}
      <div className="text-md font-bold text-gray-800 bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
        {questionNumber}
      </div>
      
      <div className="flex items-start gap-4 flex-1 h-full min-h-0">
        <AnswerBox answer={answer} onAnswerChange={onAnswerChange} />
        <Question questionText={questionText} formatQuestion={formatQuestion} onQuestionClick={onQuestionClick} />
      </div>
    </div>
  );
}
import AnswerBox from "./AnswerBox";
import Question from "./Question";

interface QuestionItemProps {
  questionNumber: number;
  questionText: string;
  answer: string;
  onAnswerChange: (value: string) => void;
  formatQuestion: (text: string) => string;
}

export default function QuestionItem({ questionNumber, questionText, answer, onAnswerChange, formatQuestion }: QuestionItemProps) {
  return (
    <div className="flex flex-col items-center gap-1 h-full min-h-0 print:gap-1 print:flex-1 print:h-full">
      {/* Question number */}
      <div className="text-xs font-bold text-gray-800 bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 print:w-5 print:h-5 print:text-xs print:mb-1 print:flex-shrink-0">
        {questionNumber}
      </div>
      
      <div className="flex items-start gap-2 flex-1 h-full min-h-0 print:gap-1 print:flex-1 print:h-full print:min-h-0">
        <AnswerBox answer={answer} onAnswerChange={onAnswerChange} />
        <Question questionText={questionText} formatQuestion={formatQuestion} />
      </div>
    </div>
  );
}
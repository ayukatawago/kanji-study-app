import QuestionItem from "./QuestionItem";

interface TestGridProps {
  questions: string[];
  answers: { [key: number]: string };
  onAnswerChange: (questionIndex: number, value: string) => void;
  formatQuestion: (text: string) => string;
}

export default function TestGrid({ questions, answers, onAnswerChange, formatQuestion }: TestGridProps) {
  return (
    <>
      {/* Top row - questions 1-5 (right to left) */}
      <div className="flex flex-row-reverse justify-center gap-4 mb-2 flex-1 min-h-0 print:justify-between print:gap-2 print:mb-0 print:h-[48%]">
        {questions.slice(0, 5).map((question, index) => (
          <QuestionItem
            key={index}
            questionNumber={index + 1}
            questionText={question}
            answer={answers[index] || ""}
            onAnswerChange={(value) => onAnswerChange(index, value)}
            formatQuestion={formatQuestion}
          />
        ))}
      </div>

      {/* Bottom row - questions 6-10 (right to left) */}
      <div className="flex flex-row-reverse justify-center gap-4 flex-1 min-h-0 print:justify-between print:gap-2 print:h-[48%]">
        {questions.slice(5, 10).map((question, index) => (
          <QuestionItem
            key={index + 5}
            questionNumber={index + 6}
            questionText={question}
            answer={answers[index + 5] || ""}
            onAnswerChange={(value) => onAnswerChange(index + 5, value)}
            formatQuestion={formatQuestion}
          />
        ))}
      </div>
    </>
  );
}
import QuestionItem from "./QuestionItem";

interface TestGridProps {
  questions: string[];
  answers: { [key: number]: string };
  onAnswerChange: (questionIndex: number, value: string) => void;
  formatQuestion: (text: string) => string;
  onQuestionClick: (questionIndex: number) => void;
}

export default function TestGrid({ questions, answers, onAnswerChange, formatQuestion, onQuestionClick }: TestGridProps) {
  return (
    <>
      {/* Top row - questions 1-5 (right to left) */}
      <div className="flex-1 flex flex-row-reverse justify-center gap-6 min-h-0">
        {questions.slice(0, 5).map((question, index) => (
          <div key={index} className="mx-1">
            <QuestionItem
              questionNumber={index + 1}
              questionText={question}
              answer={answers[index] || ""}
              onAnswerChange={(value) => onAnswerChange(index, value)}
              formatQuestion={formatQuestion}
              onQuestionClick={() => onQuestionClick(index)}
            />
          </div>
        ))}
      </div>

      {/* Bottom row - questions 6-10 (right to left) */}
      <div className="flex-1 flex flex-row-reverse justify-center gap-6 min-h-0">
        {questions.slice(5, 10).map((question, index) => (
          <div key={index + 5} className="mx-1">
            <QuestionItem
              questionNumber={index + 6}
              questionText={question}
              answer={answers[index + 5] || ""}
              onAnswerChange={(value) => onAnswerChange(index + 5, value)}
              formatQuestion={formatQuestion}
              onQuestionClick={() => onQuestionClick(index + 5)}
            />
          </div>
        ))}
      </div>
    </>
  );
}
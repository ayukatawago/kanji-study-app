interface AnswerBoxProps {
  answer: string;
  onAnswerChange: (value: string) => void;
}

export default function AnswerBox({ answer, onAnswerChange }: AnswerBoxProps) {
  return (
    <div className="flex flex-col items-center h-full min-h-0 print:h-full print:flex-shrink-0">
      <div className="border-2 border-gray-600 p-1 h-full w-12 flex flex-col justify-center bg-white shadow-sm print:h-full print:w-16 print:p-1 print:shadow-none print:min-h-0">
        <textarea
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          className="w-full h-full resize-none border-none outline-none text-center text-sm leading-6 bg-transparent font-medium print:text-sm print:leading-6"
          style={{
            writingMode: "vertical-rl",
            textOrientation: "upright",
          }}
          rows={10}
        />
      </div>
    </div>
  );
}
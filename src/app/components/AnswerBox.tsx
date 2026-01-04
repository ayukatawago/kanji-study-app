interface AnswerBoxProps {
  answer: string;
  onAnswerChange: (value: string) => void;
}

export default function AnswerBox({ answer, onAnswerChange }: AnswerBoxProps) {
  return (
    <div className="border-2 border-gray-600 p-1 h-full w-20 bg-white shadow-none flex justify-center">
      <textarea
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        className="resize-none border-none outline-none leading-7 bg-transparent text-gray-900 text-3xl pt-4"
        style={{
          writingMode: "vertical-rl",
          textOrientation: "upright",
          width: "1em",
          height: "100%",
        }}
        rows={10}
      />
    </div>
  );
}
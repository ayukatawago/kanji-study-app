interface AnswerBoxProps {
  answer: string;
  onAnswerChange: (value: string) => void;
}

export default function AnswerBox({ answer, onAnswerChange }: AnswerBoxProps) {
  return (
    <div className="border-2 border-gray-600 p-1 h-full w-20 flex flex-col justify-center bg-white shadow-none">
      <textarea
        value={answer}
        onChange={(e) => onAnswerChange(e.target.value)}
        className="w-full h-full resize-none border-none outline-none text-center leading-6 bg-transparent"
        style={{
          writingMode: "vertical-rl",
          textOrientation: "upright",
        }}
        rows={10}
      />
    </div>
  );
}
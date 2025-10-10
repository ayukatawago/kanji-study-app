interface QuestionProps {
  questionText: string;
  formatQuestion: (text: string) => string;
  onQuestionClick?: () => void;
}

export default function Question({ questionText, formatQuestion, onQuestionClick }: QuestionProps) {
  return (
    <div className="flex flex-col items-center h-full min-h-0">
      <div 
        className="text-xl leading-6 px-2 py-3 h-full flex items-center justify-start font-medium text-gray-900 bg-gray-50 rounded-lg shadow-none cursor-pointer hover:bg-gray-100 transition-colors"
        style={{
          writingMode: "vertical-rl",
          textOrientation: "upright",
          fontFamily: "'Noto Serif JP', 'Yu Mincho', 'YuMincho', 'Hiragino Mincho Pro', serif",
        }}
        onClick={onQuestionClick}
        dangerouslySetInnerHTML={{ 
          __html: formatQuestion(questionText) 
        }}
      />
    </div>
  );
}
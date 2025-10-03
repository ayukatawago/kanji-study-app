interface QuestionProps {
  questionText: string;
  formatQuestion: (text: string) => string;
}

export default function Question({ questionText, formatQuestion }: QuestionProps) {
  return (
    <div className="flex flex-col items-center h-full min-h-0 print:h-full print:flex-shrink-0">
      <div 
        className="text-sm leading-6 p-2 h-full flex items-center justify-start font-medium text-gray-900 bg-gray-50 rounded-lg shadow-sm print:text-sm print:leading-6 print:h-full print:p-1 print:shadow-none print:bg-gray-100 print:min-h-0 print:whitespace-nowrap"
        style={{
          writingMode: "vertical-rl",
          textOrientation: "upright",
          fontFamily: "'Noto Serif JP', 'Yu Mincho', 'YuMincho', 'Hiragino Mincho Pro', serif",
        }}
        dangerouslySetInnerHTML={{ 
          __html: formatQuestion(questionText) 
        }}
      />
    </div>
  );
}
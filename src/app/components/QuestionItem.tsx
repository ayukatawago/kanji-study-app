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
        {/* Answer box */}
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
        
        {/* Question */}
        <div className="flex flex-col items-center h-full min-h-0 print:h-full print:flex-shrink-0">
          <div 
            className="text-sm leading-6 p-2 h-full flex items-center justify-center font-medium text-gray-900 bg-gray-50 rounded-lg shadow-sm print:text-sm print:leading-6 print:h-full print:p-1 print:shadow-none print:bg-gray-100 print:min-h-0 print:whitespace-nowrap"
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
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";

interface TestData {
  tests: {
    id: number;
    question: string[];
  }[];
}

export default function KanjiTest() {
  const [testData, setTestData] = useState<TestData | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    fetch("/kanji.json")
      .then((res) => res.json())
      .then((data: TestData) => {
        setTestData(data);
        // Initialize answers object
        const initialAnswers: { [key: number]: string } = {};
        data.tests[0]?.question.forEach((_, index) => {
          initialAnswers[index] = "";
        });
        setAnswers(initialAnswers);
      })
      .catch((error) => console.error("Error loading test data:", error));
  }, []);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: value,
    }));
  };

  const formatQuestion = (text: string) => {
    // Replace <text> with bold formatting
    return text.replace(/<([^>]+)>/g, "<strong>$1</strong>");
  };

  if (!testData) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-600">テストデータを読み込み中...</div>
      </div>
    );
  }

  const questions = testData.tests[0]?.question || [];

  return (
    <div className="h-screen flex flex-col max-w-6xl mx-auto px-2 py-1 print:w-full print:max-w-none print:p-0 print:h-screen print:flex print:flex-col print:box-border">
      <div className="flex justify-between items-center mb-2 print:hidden flex-shrink-0">
        <div></div>
        <h1 className="text-xl font-bold text-center text-gray-900">
          漢字テスト
        </h1>
        <button
          onClick={() => window.print()}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs transition-colors"
        >
          印刷
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-2 flex-1 flex flex-col min-h-0 print:shadow-none print:p-1 print:h-screen print:flex print:flex-col print:box-border">
        {/* Top row - questions 1-5 (right to left) */}
        <div className="flex flex-row-reverse justify-between mb-2 flex-1 min-h-0 print:justify-between print:gap-2 print:mb-0 print:h-[48%]">
          {questions.slice(0, 5).map((question, index) => (
            <div key={index} className="flex flex-col items-center gap-1 flex-1 h-full min-h-0 print:gap-1 print:flex-1 print:h-full">
              {/* Question number */}
              <div className="text-xs font-bold text-gray-800 bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 print:w-5 print:h-5 print:text-xs print:mb-1 print:flex-shrink-0">
                {index + 1}
              </div>
              
              <div className="flex items-start gap-2 flex-1 h-full min-h-0 print:gap-1 print:flex-1 print:h-full print:min-h-0">
                {/* Answer box */}
                <div className="flex flex-col items-center h-full min-h-0 print:h-full print:flex-shrink-0">
                  <div className="border-2 border-gray-600 p-1 h-full w-12 flex flex-col justify-center bg-white shadow-sm print:h-full print:w-16 print:p-1 print:shadow-none print:min-h-0">
                    <textarea
                      value={answers[index] || ""}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
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
                      __html: formatQuestion(question) 
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row - questions 6-10 (right to left) */}
        <div className="flex flex-row-reverse justify-between flex-1 min-h-0 print:justify-between print:gap-2 print:h-[48%]">
          {questions.slice(5, 10).map((question, index) => (
            <div key={index + 5} className="flex flex-col items-center gap-1 flex-1 h-full min-h-0 print:gap-1 print:flex-1 print:h-full">
              {/* Question number */}
              <div className="text-xs font-bold text-gray-800 bg-gray-100 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 print:w-5 print:h-5 print:text-xs print:mb-1 print:flex-shrink-0">
                {index + 6}
              </div>
              
              <div className="flex items-start gap-1 flex-1 h-full min-h-0 print:gap-1 print:flex-1 print:h-full print:min-h-0">
                {/* Answer box */}
                <div className="flex flex-col items-center h-full min-h-0 print:h-full print:flex-shrink-0">
                  <div className="border-2 border-gray-600 p-1 h-full w-12 flex flex-col justify-center bg-white shadow-sm print:h-full print:w-16 print:p-1 print:shadow-none print:min-h-0">
                    <textarea
                      value={answers[index + 5] || ""}
                      onChange={(e) => handleAnswerChange(index + 5, e.target.value)}
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
                    className="text-sm leading-6 p-1 h-full flex items-center justify-center font-medium text-gray-900 bg-gray-50 rounded-lg shadow-sm print:text-sm print:leading-6 print:h-full print:p-1 print:shadow-none print:bg-gray-100 print:min-h-0 print:whitespace-nowrap"
                    style={{
                      writingMode: "vertical-rl",
                      textOrientation: "upright",
                      fontFamily: "'Noto Serif JP', 'Yu Mincho', 'YuMincho', 'Hiragino Mincho Pro', serif",
                    }}
                    dangerouslySetInnerHTML={{ 
                      __html: formatQuestion(question) 
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}
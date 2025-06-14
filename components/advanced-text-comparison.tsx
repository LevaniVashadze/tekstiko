"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import { createEnhancedVisualization } from "@/lib/advanced-diff";

interface AdvancedTextComparisonProps {
  userText: string;
  correctText: string;
  originalText: string;
}

interface HoverState {
  position: { x: number; y: number };
  correctedText: string;
  userWord: string;
}

export function AdvancedTextComparison({
  userText,
  correctText,
  referenceID,
}: AdvancedTextComparisonProps & { referenceID?: string }) {
  const [activeWord, setActiveWord] = useState<HoverState | null>(null);
  const [highlightingEnabled, setHighlightingEnabled] = useState(true);
  // Format text for consistent spacing and punctuation
  const formatText = (text: string): string => {
    return (
      text
        // Add space after punctuation if missing
        .replace(/([.,!?;:])(?!\s|$)/g, "$1 ")
        // Remove multiple spaces
        .replace(/\s+/g, " ")
        // Trim leading/trailing spaces
        .trim()
    );
  };

  // Create comprehensive diff analysis using the simplified system
  const getDiffData = () => {
    const textToCompare = highlightingEnabled ? formatText(userText) : userText;
    return createEnhancedVisualization(textToCompare, correctText);
  };

  const handleWordInteraction = (
    correction: string,
    userWord: string,
    event: React.MouseEvent | React.TouchEvent
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();

    setActiveWord({
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      },
      correctedText: correction,
      userWord: userWord,
    });
  };

  const handleWordClick = (
    correction: string,
    userWord: string,
    event: React.MouseEvent | React.TouchEvent
  ) => {
    event.preventDefault();
    handleWordInteraction(correction, userWord, event);
  };
  const renderUserText = () => {
    const visualization = getDiffData();

    // Filter out missing elements when highlighting is disabled
    const filteredVisualization = highlightingEnabled
      ? visualization
      : visualization.filter((item) => item.type !== "missing");

    return (
      <div className="leading-relaxed space-x-1">
        {filteredVisualization.map((item, index) => {
          const baseClasses = "georgian-text inline";
          let wordClasses = baseClasses;
          let shouldShowHover = false;

          if (highlightingEnabled) {
            switch (item.type) {
              case "incorrect":
                wordClasses +=
                  " px-0.5 py-0.5 rounded cursor-pointer bg-yellow-100 text-yellow-800 border-b-2 border-yellow-400 hover:bg-yellow-200 active:bg-yellow-300 underline decoration-wavy decoration-yellow-600";
                shouldShowHover = true;
                break;
              case "extra":
                wordClasses +=
                  " px-0.5 py-0.5 rounded cursor-pointer bg-red-100 text-red-800 border-b-2 border-red-400 hover:bg-red-200 active:bg-red-300 line-through decoration-red-600 decoration-2";
                shouldShowHover = true;
                break;
              case "missing":
                // Style missing elements with a distinctive appearance
                if (item.missingType === "punctuation") {
                  wordClasses +=
                    " px-1 py-0.5 rounded cursor-pointer bg-blue-50 text-blue-900 border-2 border-blue-300 border-dashed hover:bg-blue-100 active:bg-blue-200 shadow-sm ring-1 ring-blue-200";
                } else {
                  wordClasses +=
                    " px-0.5 py-0.5 rounded cursor-pointer bg-purple-100 text-purple-800 border-2 border-purple-400 border-dashed hover:bg-purple-200 active:bg-purple-300";
                }
                shouldShowHover = true;
                break;
              case "correct":
              default:
                wordClasses += " text-gray-800";
                break;
            }
          } else {
            // When highlighting is disabled, show all text in default color
            wordClasses += " text-gray-800";
          }

          return (
            <span key={index} className="relative inline-block">
              <span
                className={wordClasses}
                onMouseEnter={
                  highlightingEnabled && shouldShowHover && item.correction
                    ? (e) =>
                        handleWordInteraction(item.correction!, item.text, e)
                    : undefined
                }
                onMouseLeave={
                  highlightingEnabled && shouldShowHover
                    ? () => setActiveWord(null)
                    : undefined
                }
                onClick={
                  highlightingEnabled && shouldShowHover && item.correction
                    ? (e) => handleWordClick(item.correction!, item.text, e)
                    : undefined
                }
                onTouchEnd={
                  highlightingEnabled && shouldShowHover && item.correction
                    ? (e) => handleWordClick(item.correction!, item.text, e)
                    : undefined
                }
              >
                {item.text}
              </span>
              {/* Add space after each word except the last one */}
              {index < filteredVisualization.length - 1 &&
                !item.text.match(/[.,!?;:]$/) &&
                " "}
            </span>
          );
        })}
      </div>
    );
  };
  const renderCorrectText = () => {
    // Simply split the correct text into words for display
    const words = correctText.trim().split(/\s+/);

    return (
      <div className="leading-relaxed space-x-1">
        {words.map((word, index) => {
          const baseClasses = "georgian-text inline text-gray-800";

          // Highlight words that are part of the active correction
          let shouldHighlight = false;
          if (activeWord && activeWord.correctedText.includes(word)) {
            shouldHighlight = true;
          }

          return (
            <span key={index} className="inline-block">
              <span
                className={`${baseClasses} transition-all duration-300 ${
                  shouldHighlight
                    ? "bg-green-200 text-green-900 px-1 rounded border border-green-300"
                    : ""
                }`}
              >
                {word}
              </span>
              {/* Add space after each word except the last one */}
              {index < words.length - 1 && " "}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 relative">
      {/* Simple Correction Popup */}
      {activeWord && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${activeWord.position.x}px`,
            top: `${activeWord.position.y}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-2 max-w-sm">
            <div className="text-sm georgian-text text-gray-800 font-medium">
              {activeWord.correctedText}
            </div>
          </div>
        </div>
      )}

      {/* Reference ID and Toggle Control */}
      <div className="flex justify-between items-center mb-4">
        {/* Reference ID */}
        {referenceID && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">კოდი:</span>
            <span
              className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded border"
              style={{
                fontFamily:
                  'Monaco, Menlo, "Ubuntu Mono", "Courier New", monospace',
              }}
            >
              {referenceID}
            </span>
          </div>
        )}

        {/* Toggle Control */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 georgian-text">
            მარკირება:
          </span>
          <button
            onClick={() => setHighlightingEnabled(!highlightingEnabled)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors georgian-text ${
              highlightingEnabled
                ? "bg-blue-100 text-blue-700 border border-blue-300"
                : "bg-gray-100 text-gray-700 border border-gray-300"
            }`}
          >
            {highlightingEnabled ? "ჩართული" : "გამორთული"}
          </button>
        </div>
      </div>

      {/* Text Comparison */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-800 georgian-text">
              სწორი ვარიანტი
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              {renderCorrectText()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2 georgian-text">
              <XCircle className="h-5 w-5" />
              თქვენი ვარიანტი
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg border border-blue-200">
              {renderUserText()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      {highlightingEnabled && (
        <Card>
          <CardHeader>
            <CardTitle className="georgian-text">როგორ გამოვიყენოთ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 border-b-2 border-yellow-400 rounded underline decoration-wavy decoration-yellow-600">
                    განსხვავებული
                  </span>
                  <span className="georgian-text">
                    სიტყვები, რომლებიც განსხვავდება სწორი ვარიანტისგან
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-red-100 text-red-800 border-b-2 border-red-400 rounded line-through decoration-red-600 decoration-2">
                    ზედმეტი
                  </span>
                  <span className="georgian-text">
                    სიტყვები, რომლებიც უნდა ამოიშალოს (გადახაზული)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-50 text-blue-900 border-2 border-blue-300 border-dashed rounded shadow-sm ring-1 ring-blue-200">
                    დაკარგული პუნქტუაცია
                  </span>
                  <span className="georgian-text">
                    დაკარგული პუნქტუაცია მონიშნული ლურჯი წყვეტილი ჩარჩოთი
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 border-2 border-purple-400 border-dashed rounded">
                    დაკარგული სიტყვები
                  </span>
                  <span className="georgian-text">
                    დაკარგული სიტყვები ჩასმული იასამნისფერი წყვეტილი ჩარჩოთი
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

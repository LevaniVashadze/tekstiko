"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
                  " px-0.5 py-0.5 rounded cursor-pointer bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-b-2 border-yellow-400 dark:border-yellow-600 hover:bg-yellow-200 dark:hover:bg-yellow-800 active:bg-yellow-300 dark:active:bg-yellow-700 underline decoration-wavy decoration-yellow-600 dark:decoration-yellow-400";
                shouldShowHover = true;
                break;
              case "extra":
                wordClasses +=
                  " px-0.5 py-0.5 rounded cursor-pointer bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-b-2 border-red-400 dark:border-red-600 hover:bg-red-200 dark:hover:bg-red-800 active:bg-red-300 dark:active:bg-red-700 line-through decoration-red-600 dark:decoration-red-400 decoration-2";
                shouldShowHover = true;
                break;
              case "missing":
                // Style missing elements with a distinctive appearance
                if (item.missingType === "punctuation") {
                  wordClasses +=
                    " px-1 py-0.5 rounded cursor-pointer bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-200 border-2 border-blue-300 dark:border-blue-600 border-dashed hover:bg-blue-100 dark:hover:bg-blue-800 active:bg-blue-200 dark:active:bg-blue-700 shadow-sm ring-1 ring-blue-200 dark:ring-blue-600";
                } else {
                  wordClasses +=
                    " px-0.5 py-0.5 rounded cursor-pointer bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-2 border-purple-400 dark:border-purple-600 border-dashed hover:bg-purple-200 dark:hover:bg-purple-800 active:bg-purple-300 dark:active:bg-purple-700";
                }
                shouldShowHover = true;
                break;
              case "correct":
              default:
                wordClasses += " text-gray-800 dark:text-gray-200";
                break;
            }
          } else {
            // When highlighting is disabled, show all text in default color
            wordClasses += " text-gray-800 dark:text-gray-200";
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
          const baseClasses =
            "georgian-text inline text-gray-800 dark:text-gray-200";

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
                    ? "bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-200 px-1 rounded border border-green-300 dark:border-green-600"
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
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-2 max-w-sm">
            <div className="text-sm georgian-text text-gray-800 dark:text-gray-200 font-medium">
              {activeWord.correctedText}
            </div>
          </div>
        </div>
      )}

      {/* Reference ID and Toggle Control */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2 mb-4">
        {/* Reference ID */}
        {referenceID && (
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              კოდი:
            </span>
            <span
              className="text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-1 sm:px-2 py-1 rounded border"
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
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 georgian-text">
            მარკირება:
          </span>
          <button
            onClick={() => setHighlightingEnabled(!highlightingEnabled)}
            className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-medium transition-colors georgian-text ${
              highlightingEnabled
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
            }`}
          >
            {highlightingEnabled ? "ჩართული" : "გამორთული"}
          </button>
        </div>
      </div>

      {/* Text Comparison */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-green-800 dark:text-green-400 georgian-text text-base md:text-lg">
              სწორი ვარიანტი
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            <div className="p-3 md:p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
              {renderCorrectText()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-blue-800 dark:text-blue-400 flex items-center gap-2 georgian-text text-base md:text-lg">
              თქვენი ვარიანტი
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            <div className="p-3 md:p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
              {renderUserText()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      {highlightingEnabled && (
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="georgian-text text-base md:text-lg dark:text-gray-100">
              როგორ გამოვიყენოთ
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-b-2 border-yellow-400 dark:border-yellow-600 rounded underline decoration-wavy decoration-yellow-600 dark:decoration-yellow-400 text-xs whitespace-nowrap">
                    განსხვავებული
                  </span>
                  <span className="georgian-text text-xs sm:text-sm dark:text-gray-300">
                    სიტყვები, რომლებიც განსხვავდება სწორი ვარიანტისგან
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-b-2 border-red-400 dark:border-red-600 rounded line-through decoration-red-600 dark:decoration-red-400 decoration-2 text-xs whitespace-nowrap">
                    ზედმეტი
                  </span>
                  <span className="georgian-text text-xs sm:text-sm dark:text-gray-300">
                    სიტყვები, რომლებიც უნდა ამოიშალოს (გადახაზული)
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-200 border-2 border-blue-300 dark:border-blue-600 border-dashed rounded shadow-sm ring-1 ring-blue-200 dark:ring-blue-600 text-xs whitespace-nowrap">
                    დაკარგული პუნქტუაცია
                  </span>
                  <span className="georgian-text text-xs sm:text-sm dark:text-gray-300">
                    დაკარგული პუნქტუაცია მონიშნული ლურჯი წყვეტილი ჩარჩოთი
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-2 border-purple-400 dark:border-purple-600 border-dashed rounded text-xs whitespace-nowrap">
                    დაკარგული სიტყვები
                  </span>
                  <span className="georgian-text text-xs sm:text-sm dark:text-gray-300">
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

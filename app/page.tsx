"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { EditableText } from "@/components/editable-text";
import { AdvancedTextComparison } from "@/components/advanced-text-comparison";
import { RotateCcw, Undo2 } from "lucide-react";

interface Text {
  id: string;
  referenceID: string;
  text: string;
  correctedText: string;
}

interface UserText {
  id: string;
  textId: string;
  userAnswer: string;
  isCompleted: boolean;
}

export default function HomePage() {
  const [currentText, setCurrentText] = useState<Text | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [originalAnswer, setOriginalAnswer] = useState("");
  const [showComparison, setShowComparison] = useState(false);
  const [userTexts, setUserTexts] = useState<UserText[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editHistory, setEditHistory] = useState<string[]>([]);
  const [allTextsCompleted, setAllTextsCompleted] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      const loadedUserTexts = loadUserTexts();
      // Load next text with the loaded user texts
      loadNextText(loadedUserTexts);
    };

    initializeApp();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showComparison) return; // Disable shortcuts during comparison

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "z":
            e.preventDefault();
            handleUndo();
            break;
          case "r":
            e.preventDefault();
            handleReset();
            break;
          case "enter":
            e.preventDefault();
            handleSubmit();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showComparison, editHistory, userAnswer, originalAnswer, isSubmitting]);

  const loadUserTexts = () => {
    const stored = localStorage.getItem("tekstiko-completed");
    if (stored) {
      const parsedUserTexts = JSON.parse(stored);
      setUserTexts(parsedUserTexts);
      return parsedUserTexts;
    }
    return [];
  };

  const saveUserText = (textId: string, answer: string, completed: boolean) => {
    const newUserText: UserText = {
      id: Date.now().toString(),
      textId,
      userAnswer: answer,
      isCompleted: completed,
    };

    const updated = [
      ...userTexts.filter((ut) => ut.textId !== textId),
      newUserText,
    ];
    setUserTexts(updated);
    localStorage.setItem("tekstiko-completed", JSON.stringify(updated));
  };

  const loadNextText = async (currentUserTexts?: UserText[]) => {
    try {
      // Use provided userTexts or current state
      const textsToUse = currentUserTexts || userTexts;

      // Get completed text IDs
      const completedTextIds = textsToUse
        .filter((ut) => ut.isCompleted)
        .map((ut) => ut.textId);

      // Build query string with completed IDs
      const queryParams =
        completedTextIds.length > 0
          ? `?completed=${completedTextIds.join(",")}`
          : "";

      const response = await fetch(`/api/texts/next${queryParams}`);
      if (response.ok) {
        const text = await response.json();
        setCurrentText(text);
        setShowComparison(false);

        // Load existing user answer if available, otherwise start with original text
        const existingUserText = textsToUse.find((ut) => ut.textId === text.id);
        if (existingUserText && !existingUserText.isCompleted) {
          // Load incomplete text for continued editing
          setUserAnswer(existingUserText.userAnswer);
          setOriginalAnswer(text.text);
          setEditHistory([text.text, existingUserText.userAnswer]);
        } else {
          // Pre-load the original text for editing
          setUserAnswer(text.text);
          setOriginalAnswer(text.text);
          setEditHistory([text.text]);
        }
      } else {
        const errorData = await response.json();
        if (response.status === 404) {
          // No more texts available
          setAllTextsCompleted(true);
          setCurrentText(null);
        } else {
          toast.error(errorData.error || "ტექსტის ჩატვირთვა ვერ მოხერხდა");
        }
      }
    } catch {
      toast.error("ტექსტის ჩატვირთვა ვერ მოხერხდა");
    }
  };

  const handleLoadNextText = () => {
    loadNextText();
  };

  const handleResetProgress = () => {
    // Clear all completed texts
    localStorage.removeItem("tekstiko-completed");
    setUserTexts([]);
    setCurrentText(null);
    setShowComparison(false);
    setAllTextsCompleted(false);
    // Load a fresh text
    loadNextText([]);
  };

  const handleSubmit = async () => {
    if (!currentText || !userAnswer.trim()) {
      toast.error("გთხოვთ შეიყვანოთ თქვენი შესწორებული ტექსტი");
      return;
    }

    setIsSubmitting(true);

    try {
      saveUserText(currentText.id, userAnswer, true);
      setShowComparison(true);
      toast.success("ტექსტი წარმატებით გაიგზავნა!");
    } catch {
      toast.error("ტექსტის გაგზავნა ვერ მოხერხდა");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextChange = (newText: string) => {
    setUserAnswer(newText);
    // Add to history if it's different from the last entry
    if (
      editHistory.length === 0 ||
      editHistory[editHistory.length - 1] !== newText
    ) {
      setEditHistory((prev) => [...prev, newText]);
    }
  };

  const handleUndo = () => {
    if (editHistory.length > 1) {
      const newHistory = editHistory.slice(0, -1);
      setEditHistory(newHistory);
      setUserAnswer(newHistory[newHistory.length - 1]);
    }
  };

  const handleReset = () => {
    if (currentText) {
      setUserAnswer(originalAnswer);
      setEditHistory([originalAnswer]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 md:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">
              ტექსტიკო
            </h1>
            <p className="text-sm md:text-base text-gray-600 georgian-text">
              ქართული გრამატიკის სასწავლო პლატფორმა
            </p>
          </div>
        </div>

        {currentText ? (
          <div className="space-y-4 md:space-y-6">
            {!showComparison ? (
              /* Editing Mode - Full Width */
              <Card>
                <CardHeader className="pb-3 md:pb-6">
                  <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <span className="georgian-text text-base md:text-lg">
                      ტექსტის რედაქტირება და შესწორება
                    </span>
                    <span className="text-xs md:text-sm georgian-text text-gray-600">
                      კოდი:
                      <span
                        className="ml-1 bg-gray-100 text-gray-800 px-1 md:px-2 py-1 rounded border text-xs"
                        style={{
                          fontFamily:
                            'Monaco, Menlo, "Ubuntu Mono", "Courier New", monospace',
                        }}
                      >
                        {currentText.referenceID}
                      </span>
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4 px-3 md:px-6">
                  <div>
                    <EditableText
                      value={userAnswer}
                      originalText={originalAnswer}
                      onChange={handleTextChange}
                      disabled={false}
                      placeholder="შეასწორეთ ქართული ტექსტი გრამატიკული შეცდომების გამოსასწორებლად..."
                    />

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-3 md:mt-4 gap-3 sm:gap-2">
                      <div className="flex gap-1 md:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleUndo}
                          disabled={editHistory.length <= 1}
                          className="flex items-center gap-1 btn-transition georgian-text text-xs md:text-sm px-2 md:px-3"
                        >
                          <Undo2 className="h-3 w-3" />
                          <span className="hidden sm:inline">
                            გაუქმება (Ctrl+Z)
                          </span>
                          <span className="sm:hidden">გაუქმება</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleReset}
                          disabled={userAnswer === originalAnswer}
                          className="flex items-center gap-1 btn-transition georgian-text text-xs md:text-sm px-2 md:px-3"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span className="hidden sm:inline">
                            განულება (Ctrl+R)
                          </span>
                          <span className="sm:hidden">განულება</span>
                        </Button>
                      </div>

                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="btn-transition georgian-text text-sm md:text-base w-full sm:w-auto"
                      >
                        {isSubmitting ? (
                          "იგზავნება..."
                        ) : (
                          <>
                            <span className="hidden sm:inline">
                              დასრულება (Ctrl+Enter)
                            </span>
                            <span className="sm:hidden">დასრულება</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Comparison Mode - Advanced Text Comparison */
              <AdvancedTextComparison
                userText={userAnswer}
                correctText={currentText.correctedText}
                originalText={currentText.text}
                referenceID={currentText.referenceID}
              />
            )}

            {showComparison && (
              <div className="text-center px-2">
                <Button
                  onClick={handleLoadNextText}
                  size="lg"
                  className="btn-transition georgian-text w-full sm:w-auto"
                >
                  შემდეგი ტექსტი
                </Button>
              </div>
            )}
          </div>
        ) : allTextsCompleted ? (
          <Card>
            <CardContent className="text-center py-8 md:py-12 px-4 md:px-6">
              <div className="space-y-3 md:space-y-4">
                <div className="text-4xl md:text-6xl mb-2 md:mb-4">🎉</div>
                <h2 className="text-xl md:text-2xl font-bold text-green-600 mb-2 georgian-text">
                  გილოცავთ!
                </h2>
                <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 georgian-text">
                  თქვენ დაასრულეთ ყველა ხელმისაწვდომი ტექსტი. შესანიშნავი
                  მუშაობა ქართული გრამატიკის უნარების გაუმჯობესებისთვის!
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={handleResetProgress}
                    size="lg"
                    className="georgian-text w-full sm:w-auto"
                  >
                    პროგრესის განულება და თავიდან დაწყება
                  </Button>
                  <p className="text-xs md:text-sm text-gray-500 georgian-text">
                    ეს გაასუფთავებს თქვენს პროგრესს და საშუალებას მოგცემთ ისევ
                    ივარჯიშოთ ყველა ტექსტზე
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-8 md:py-12 px-4 md:px-6">
              <p className="text-sm md:text-base text-gray-600 mb-4 georgian-text">
                ტექსტი იტვირთება...
              </p>
              <Button
                onClick={handleLoadNextText}
                className="georgian-text w-full sm:w-auto"
              >
                კვლავ სცადეთ
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

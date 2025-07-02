"use client";

import React, { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";

interface EditableTextProps {
  value: string;
  originalText: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function EditableText({
  value,
  originalText,
  onChange,
  disabled,
  placeholder,
  className,
}: EditableTextProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    adjustHeight();
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`resize-none overflow-hidden georgian-text bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 ${className}`}
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "120px",
        }}
      />

      {/* Change counter - inside textarea on desktop only */}
      {!disabled && originalText && (
        <div className="absolute top-2 right-2 hidden md:block z-10">
          <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
            {
              value.split(/(\s+)/).filter((part, index) => {
                const originalWords = originalText.split(/(\s+)/);
                const originalPart = originalWords[index] || "";
                return (
                  part.trim() !== originalPart.trim() &&
                  part.trim() !== "" &&
                  originalPart.trim() !== ""
                );
              }).length
            }{" "}
            ცვლილება
          </div>
        </div>
      )}
    </div>
  );
}

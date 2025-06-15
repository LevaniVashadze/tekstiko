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
        className={`resize-none overflow-hidden georgian-text ${className}`}
        style={{
          position: "relative",
          zIndex: 2,
          backgroundColor: "rgba(255,255,255,0.9)",
          minHeight: "120px",
        }}
      />

      {/* Background overlay showing changes */}
      {!disabled && originalText && (
        <div
          className="absolute inset-0 p-3 overflow-hidden pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <div className="text-transparent text-sm leading-6 whitespace-pre-wrap break-words font-mono">
            {value.split(/(\s+)/).map((part, index) => {
              const originalWords = originalText.split(/(\s+)/);
              const originalPart = originalWords[index] || "";
              const isChanged =
                part.trim() !== originalPart.trim() &&
                part.trim() !== "" &&
                originalPart.trim() !== "";

              return (
                <span
                  key={index}
                  className={isChanged ? "changed-text" : ""}
                  title={
                    isChanged ? `Original: "${originalPart.trim()}"` : undefined
                  }
                >
                  {part}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Change counter */}
      {!disabled && originalText && (
        <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full z-10">
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
          changes
        </div>
      )}
    </div>
  );
}

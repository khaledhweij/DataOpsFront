import React, { useState } from "react";
import "./TextInputContent.css";

interface TextInputContentProps {
  firstContent: string;
  firstFileInputRef: React.RefObject<HTMLInputElement | null>;
  setFirstContent: React.Dispatch<React.SetStateAction<string>>;
  setFirstFileName: React.Dispatch<React.SetStateAction<string>>;
  setActiveInput: React.Dispatch<React.SetStateAction<string>>;
  expandedTextarea: string | null;
  setExpandedTextarea: React.Dispatch<React.SetStateAction<string | null>>;
  firstTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
}

const TextInputContent: React.FC<TextInputContentProps> = ({
  firstContent,
  firstFileInputRef,
  setFirstContent,
  setFirstFileName,
  setActiveInput,
  expandedTextarea,
  setExpandedTextarea,
}) => {
  // --- Local states for text statistics ---
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);

  // --- Text handling ---
  const handleTextChange = (value: string) => {
    setFirstContent(value);
    setWordCount(value.trim() === "" ? 0 : value.trim().split(/\s+/).length);
    setCharCount(value.length);
  };

  const handleCursorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.target.selectionStart);
  };

  const handleAutoResize = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // --- File processing ---
  const processFile = (
    file: File,
    setContent: React.Dispatch<React.SetStateAction<string>>,
    setFileName: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setContent(e.target?.result as string);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file, setFirstContent, setFirstFileName);
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processFile(file, setFirstContent, setFirstFileName);
  };

  // --- Expand / Collapse textarea ---
  const toggleExpand = (inputId: string) => {
    setExpandedTextarea((prev) => (prev === inputId ? null : inputId));
  };

  // --- Render Textarea component ---
  const renderTextarea = (
    id: "1",
    value: string,
    onTextChange: (value: string) => void,
    onCursorChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  ) => (
    <textarea
      id="first-content"
      value={value}
      onChange={(e) => {
        onTextChange(e.target.value);
        handleAutoResize(e.target);
      }}
      onSelect={onCursorChange}
      placeholder="Enter Content (Alt + Z to expand)"
      onFocus={() => setActiveInput(id)}
      onDrop={(e) => handleDrop(e)}
      onDragOver={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.altKey && e.key === "z") {
          e.preventDefault();
          toggleExpand(id);
        }
      }}
      className={`input-textarea ${
        expandedTextarea === id ? "input-content-expanded" : ""
      }`}
    />
  );

  // --- Render Component ---
  return (
    <div className="container">
      <div className="input-content-container">
        <input
          type="file"
          ref={firstFileInputRef}
          onChange={handleFileChange}
          onFocus={() => setActiveInput("1")}
          className="input-text"
        />

        {renderTextarea("1", firstContent, handleTextChange, handleCursorChange)}

        <div className="text-stats">
          <small>
            📝 {wordCount} words | {charCount} chars | Cursor at{" "}
            {cursorPosition}
          </small>
        </div>
      </div>
    </div>
  );
};

export default TextInputContent;

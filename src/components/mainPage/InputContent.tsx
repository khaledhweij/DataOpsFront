import React from "react";
import "./InputContent.css";

interface InputContentProps {
  firstContent: string;
  secondContent: string;
  firstFileInputRef: React.RefObject<HTMLInputElement| null>;
  secondFileInputRef: React.RefObject<HTMLInputElement| null>;
  setFirstContent: React.Dispatch<React.SetStateAction<string>>;
  setSecondContent: React.Dispatch<React.SetStateAction<string>>;
  setFirstFileName: React.Dispatch<React.SetStateAction<string>>;
  setSecondFileName: React.Dispatch<React.SetStateAction<string>>;
  setActiveInput: React.Dispatch<React.SetStateAction<string>>;
  expandedTextarea: string | null;
  setExpandedTextarea: React.Dispatch<React.SetStateAction<string | null>>;
  firstTextareaRef: React.RefObject<HTMLTextAreaElement| null>;
  secondTextareaRef: React.RefObject<HTMLTextAreaElement| null>;
}

const InputContent: React.FC<InputContentProps> = ({
  firstContent,
  secondContent,
  firstFileInputRef,
  secondFileInputRef,
  setFirstContent,
  setSecondContent,
  setFirstFileName,
  setSecondFileName,
  setActiveInput,
  expandedTextarea,
  setExpandedTextarea,
}) => {

  const handleAutoResize = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

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

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isFirst: boolean
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processFile(file,
      isFirst ? setFirstContent : setSecondContent,
      isFirst ? setFirstFileName : setSecondFileName
    );
  };

  const handleDrop = (
    e: React.DragEvent<HTMLTextAreaElement>,
    isFirst: boolean
  ) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    processFile(file,
      isFirst ? setFirstContent : setSecondContent,
      isFirst ? setFirstFileName : setSecondFileName
    );
  };

  const toggleExpand = (inputId: string) => {
    setExpandedTextarea(prev => (prev === inputId ? null : inputId));
  };

  const renderTextarea = (
    id: "1" | "2",
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>
  ) => (
    <textarea
      id={id === "1" ? "first-content" : "second-content"}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        handleAutoResize(e.target);
      }}
      placeholder={`Enter ${id === "1" ? "First" : "Second"} Content (Alt + Z to expand)`}
      onFocus={() => setActiveInput(id)}
      onDrop={(e) => handleDrop(e, id === "1")}
      onDragOver={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.altKey && e.key === "z") {
          e.preventDefault();
          toggleExpand(id);
        }
      }}
      className={expandedTextarea === id ? "input-content-expanded" : "input-content"}
    />
  );

  return (
    <div className="container">
      <div className="input-content-group">

        {/* First Input */}
        <div className="input-content-container">
          <input
            type="file"
            ref={firstFileInputRef}
            onChange={(e) => handleFileChange(e, true)}
            onFocus={() => setActiveInput("1")}
            className="input-text"
          />
          {renderTextarea("1", firstContent, setFirstContent)}
        </div>

        {/* Second Input */}
        <div className="input-content-container">
          <input
            type="file"
            ref={secondFileInputRef}
            onChange={(e) => handleFileChange(e, false)}
            onFocus={() => setActiveInput("2")}
            className="input-text"
          />
          {renderTextarea("2", secondContent, setSecondContent)}
        </div>

      </div>
    </div>
  );
};

export default InputContent;

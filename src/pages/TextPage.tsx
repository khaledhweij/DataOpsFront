import "./MainPage.css";
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import TextInputContent from "../components/textPage/TextInputContent";
import TextOutputContent from "../components/textPage/TextOutputContent";
import logo from "../constants/header-logo.png";
import TextBaseButtons from "../components/textPage/TextBaseButtons";
import { postActionRaw } from "../services/apiService";
import { useContent } from "../hooks/useContent";
import { JSX } from "react/jsx-runtime";
import TopNavigation from "../components/TopNavigation";

type Nullable<T> = T | null;

export default function MainPage(): JSX.Element {
  // Content states
  const [firstContent, setFirstContent] = useState<string>("");
  const [firstFileName, setFirstFileName] = useState<string>("");
  const [darkMode, setDarkMode] = useState(false);

  // UI / control states
  const { output, setOutput } = useContent();
  const firstFileInputRef = useRef<HTMLInputElement>(null);
  const [activeInput, setActiveInput] = useState<string>("1");
  const [showDiv, setShowDiv] = useState<boolean>(false);
  const [firstComparedOutput, setFirstComparedOutput] = useState<string>("");
  const [textToReplace, setTextToReplace] = useState<string>("");
  const [replacementText, setReplacementText] = useState<string>("");
  const [expandedTextarea, setExpandedTextarea] = useState<string | null>(null); // "1" or "2" or null
  const firstTextareaRef = useRef<Nullable<HTMLTextAreaElement>>(null);

  // --- getContent: keeps selection behavior (Option A)
  const getContent = (): string => {
    const textarea = firstTextareaRef.current;

    if (textarea) {
      const selectionStart = textarea.selectionStart ?? 0;
      const selectionEnd = textarea.selectionEnd ?? 0;

      if (selectionStart !== selectionEnd) {
        return textarea.value.substring(selectionStart, selectionEnd);
      }
    }

    return firstContent;
  };

  // --- clear
  const handleClear = () => {
    setFirstContent("");
    setFirstFileName("");
    setOutput("");
    setShowDiv(false);
    setFirstComparedOutput("");
    setTextToReplace("");
    setReplacementText("");

    if (firstFileInputRef.current) firstFileInputRef.current.value = "";
  };

  // --- handleText
  const handleText = (action: string, search: string, replacement: string) => {
    setOutput("");

    try {
      const text = getContent();
      if (!text.trim()) {
        alert("Content cannot be empty.");
        return;
      }

      if (!search) {
        alert("Pattern to be replaced cannot be empty.");
        return;
      }

      // Escape regex special characters to make the search literal
      const escapeRegExp = (str: string) =>
        str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const regex = new RegExp(escapeRegExp(search), "g");
      let result = text;

      switch (action) {
        case "replaceAll":
          result = text.replace(regex, replacement);
          break;

        case "lineBreaksAfter":
          result = text.replace(regex, `${search}\n`);
          break;

        case "mergeLinesAfter":
          result = text.replace(new RegExp(`${escapeRegExp(search)}\\s*\\n`, "g"), `${search} `);
          break;

        case "removeCharacters":
          result = text.replace(regex, "");
          break;

        default:
          return text;
      }

      setOutput(result);

    } catch (error) {
      setOutput(`Error: ${(error as Error).message}`);
    }
  };

  const handleLines = (action: string) => {
    try {
      const text = getContent();
      if (!text.trim()) {
        alert("Content cannot be empty.");
        return;
      }

      let result = text;

      switch (action) {
        case "trimAllLines":
          result = text
            .split("\n")
            .map(line => line.trim())
            .join("\n");
          break;

        case "mergeAllLines":
          result = text.replace(/\s*\n\s*/g, " ");
          break;

        case "trimEmptyLines":
          result = text
            .split("\n")
            .filter(line => line.trim() !== "")
            .join("\n");
          break;

        default:
          return text;
      }

    setOutput(result);
    } catch (error) {
      setOutput(`Error: ${(error as Error).message}`);
    }
  };

  const handleTextInternally = (action: String) => {
    setOutput("");

    const textarea = firstTextareaRef.current;
    const fullText = firstContent;

    if (!fullText.trim()) {
      alert("Content cannot be empty.");
      return;
    }

    let selectionStart = 0;
    let selectionEnd = 0;

    if (textarea) {
      selectionStart = textarea.selectionStart ?? 0;
      selectionEnd = textarea.selectionEnd ?? 0;
    }

    const hasSelection = selectionStart !== selectionEnd;

    const applyTransform = (input: string) => {
      switch (action) {
        case "upperCase":
          return input.toUpperCase();
        case "lowerCase":
          return input.toLowerCase();
        case "titleCase":
          return input
            .toLowerCase()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        case "sentenceCase":
          return input
            .split("\n")
            .map(line => line.charAt(0).toUpperCase() + line.slice(1))
            .join("\n");

        default:
          return input;
      }
    };

    if (hasSelection) {
      const before = fullText.substring(0, selectionStart);
      const selected = fullText.substring(selectionStart, selectionEnd);
      const after = fullText.substring(selectionEnd);
      const transformed = applyTransform(selected);
      const newText = before + transformed + after;

      setOutput(newText);

      requestAnimationFrame(() => {
        if (textarea) {
          textarea.selectionStart = selectionStart;
          textarea.selectionEnd = selectionStart + transformed.length;
        }
      });
    } else {
      const transformed = applyTransform(fullText);
      setOutput(transformed);
    }
  };

  const copyOutputToInput = () => {
    setFirstContent(output);
  }

  return (
    <div className={`App ${darkMode ? "dark-mode" : ""}`}>
      <div className="document-page-content">
        <header className="header-container">
          {logo != null && (
            <div className="logo-container">
              <img src={logo} alt="Logo" className="logo" />
            </div>
          )}
          <div
            className="title-container"
            title="Your all-in-one tool (Texts) and more"
          >
            <h1 className="title">DataOps</h1>

          </div>
        </header>

        <TopNavigation
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <TextInputContent
          firstContent={firstContent}
          firstFileInputRef={firstFileInputRef}
          setFirstContent={setFirstContent}
          setFirstFileName={setFirstFileName}
          setActiveInput={setActiveInput}
          expandedTextarea={expandedTextarea}
          setExpandedTextarea={setExpandedTextarea}
          firstTextareaRef={firstTextareaRef}
        />

        <TextBaseButtons
          handleText={handleText}
          handleTextInternally={handleTextInternally}
          handleLines={handleLines}
          textToReplace={textToReplace}
          replacementText={replacementText}
          setTextToReplace={setTextToReplace}
          setReplacementText={setReplacementText}
          handleClear={handleClear}
        />

        <TextOutputContent output={output} copyOutputToInput={copyOutputToInput}/>

      </div>

      <div className="footer-container">Internally Developed - For Internal Use - Version 2.0</div>
    </div>
  );
}

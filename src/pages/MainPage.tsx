import "./MainPage.css";
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import InputContent from "../components/mainPage/InputContent";
import Button from "../components/mainPage/Buttons";
import OutputResult from "../components/mainPage/OutputResult";
import logo from "../assets/edicom-logo.png";
import BaseButtons from "../components/mainPage/BaseButtons";
import ComparasionResult from "../components/mainPage/ComparasionResult";
import { convertToEpoch } from "../services/dateService";
import { downloadZipFromBase64 as downloadZip } from "../services/fileService";
import { postActionRaw } from "../services/apiService";
import { useContent } from "../hooks/useContent";
import { JSX } from "react/jsx-runtime";
import TopNavigation from "../components/TopNavigation";
import TextComparator from "../functions/TextComparator";
  
type Nullable<T> = T | null;

export default function MainPage(): JSX.Element {
  // Content states
  const [firstContent, setFirstContent] = useState<string>("");
  const [secondContent, setSecondContent] = useState<string>("");
  const [firstFileName, setFirstFileName] = useState<string>("");
  const [secondFileName, setSecondFileName] = useState<string>("");
  const [darkMode, setDarkMode] = useState(false);

  // UI / control states
  const { output, setOutput } = useContent();
  const firstFileInputRef = useRef<HTMLInputElement>(null);
  const secondFileInputRef = useRef<HTMLInputElement>(null);
  const [activeInput, setActiveInput] = useState<string>("1");
  const [showDiv, setShowDiv] = useState<boolean>(false);
  const [firstComparedOutput, setFirstComparedOutput] = useState<string>("");
  const [secondComparedOutput, setSecondComparedOutput] = useState<string>("");
  const [textToReplace, setTextToReplace] = useState<string>("");
  const [replacementText, setReplacementText] = useState<string>("");
  const navigate = useNavigate();
  const [expandedTextarea, setExpandedTextarea] = useState<string | null>(null); // "1" or "2" or null
  const firstTextareaRef = useRef<Nullable<HTMLTextAreaElement>>(null);
  const secondTextareaRef = useRef<Nullable<HTMLTextAreaElement>>(null);
  const [resultHtml, setResultHtml] = useState("");

  // --- getContent: keeps selection behavior (Option A)
  const getContent = (): string => {
    const textarea = activeInput === "1" ? firstTextareaRef.current : secondTextareaRef.current;

    if (textarea) {
      const selectionStart = textarea.selectionStart ?? 0;
      const selectionEnd = textarea.selectionEnd ?? 0;

      if (selectionStart !== selectionEnd) {
        return textarea.value.substring(selectionStart, selectionEnd);
      }
    }

    return activeInput === "1" ? firstContent : secondContent;
  };

  // --- compare
  const compareContents = async () => {
    try {
      if (!firstContent || !secondContent) {
        setOutput("Contents cannot be empty.");
        return;
      }

      const response = await postActionRaw("compare", JSON.stringify({ firstContent, secondContent }));

      if (response.ok) {
        const data = await response.json();
        if (data.firstContent !== "" && data.secondContent !== "") {
          setFirstComparedOutput(data.firstContent);
          setSecondComparedOutput(data.secondContent);
          setShowDiv(true);
        }
        setOutput(data.output);
      } else {
        const error = await response.text();
        alert(error);
      }
    } catch (error) {
      setOutput(`Fetch error: ${(error as Error).message}`);
    }
  };



  const handleCompare = () => {
    if (firstContent === secondContent) {
      setOutput("The contents are identical.");
    } else {
      const comparator = new TextComparator();
      const comparisonResult = comparator.compare(firstContent, secondContent);
      setFirstComparedOutput(comparisonResult.formattedText1);
      setSecondComparedOutput(comparisonResult.formattedText2);
      setShowDiv(true);
      // setResultHtml();
    }
  };

  // const handleCompare = () => {
  //   if (firstContent === secondContent) {
  //     setOutput("The contents are identical.");
  //   } else {
  //     void compareContents();
  //   }
  // };

  // --- clear
  const handleClear = () => {
    setFirstContent("");
    setSecondContent("");
    setFirstFileName("");
    setSecondFileName("");
    setOutput("");
    setShowDiv(false);
    setFirstComparedOutput("");
    setSecondComparedOutput("");
    setTextToReplace("");
    setReplacementText("");

    if (firstFileInputRef.current) firstFileInputRef.current.value = "";
    if (secondFileInputRef.current) secondFileInputRef.current.value = "";
  };

  // --- view PDF / HTML
  const handleViewPdf = (pdfString: string) => {
    try {
      const byteCharacters = atob(pdfString);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      alert("Make sure the content is PDF in base64");
    }
  };

  const handleViewHtml = (base64Html: string) => {
    try {
      const htmlContent = atob(base64Html);
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      alert("Ensure the content is a valid base64-encoded HTML string.");
    }
  };

  // --- handleGlobal
  const handleGlobal = async (action: string, isAlert = false) => {
    setOutput("");
    try {
      const content = getContent();
      if (!content.trim()) {
        alert("Content cannot be empty.");
        return;
      }

      if (action === "showPdf") {
        handleViewPdf(content);
        return;
      }
      if (action === "showHtml") {
        handleViewHtml(content);
        return;
      }

      const response = await postActionRaw(action, content);

      if (response.ok) {
        const data = await response.text();
        if (isAlert) {
          alert(data);
        } else if (activeInput === "1") {
          setFirstContent(data);
        } else if (activeInput === "2") {
          setSecondContent(data);
        } else {
          setOutput(data);
        }
      } else {
        const error = await response.text();
        alert(error);
      }
    } catch (error) {
      setOutput(`Fetch error: ${(error as Error).message}`);
    }
  };

  // --- handleTextGlobal
  const handleTextGlobal = async (action: string, search: string, replacement: string) => {
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

      const response = await postActionRaw(action, JSON.stringify({ text, search, replacement }));

      if (response.ok) {
        const data = await response.text();
        if (activeInput === "1") setFirstContent(data);
        else if (activeInput === "2") setSecondContent(data);
        else setOutput(data);
      } else {
        const error = await response.text();
        alert(error);
      }
    } catch (error) {
      setOutput(`Fetch error: ${(error as Error).message}`);
    }
  };

  // --- handleTextInternally (keeps selection behavior A: replace only selection)
  const handleTextInternally = (action: String) => {
    setOutput("");

    const textarea = activeInput === "1" ? firstTextareaRef.current : secondTextareaRef.current;
    const fullText = activeInput === "1" ? firstContent : secondContent;

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

      if (activeInput === "1") setFirstContent(newText);
      else setSecondContent(newText);

      // re-select transformed text
      requestAnimationFrame(() => {
        if (textarea) {
          textarea.selectionStart = selectionStart;
          textarea.selectionEnd = selectionStart + transformed.length;
        }
      });
    } else {
      const transformed = applyTransform(fullText);
      if (activeInput === "1") setFirstContent(transformed);
      else setSecondContent(transformed);
    }
  };

  // --- epoch
  const handleEpoch = () => {
    setOutput("");
    try {
      const result = convertToEpoch(getContent());
      setOutput(result);
    } catch (error) {
      setOutput(`Converting error: ${(error as Error).message}`);
    }
  };

  // --- download zip
  const downloadZipFromBase64 = () => {
    try {
      const content = getContent();
      if (!content.trim()) {
        alert("Content cannot be empty.");
        return;
      }
      downloadZip(content);
    } catch (error) {
      setOutput(`Converting ZIP error: ${(error as Error).message}`);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

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
            title="Your all-in-one tool (JSON - XML - EDI - PDF - Base64) and more"
          >
            <h1 className="title">DataOps</h1>

          </div>
        </header>

        <TopNavigation
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
        <InputContent
          firstContent={firstContent}
          secondContent={secondContent}
          firstFileInputRef={firstFileInputRef}
          secondFileInputRef={secondFileInputRef}
          setFirstContent={setFirstContent}
          setSecondContent={setSecondContent}
          setFirstFileName={setFirstFileName}
          setSecondFileName={setSecondFileName}
          setActiveInput={setActiveInput}
          expandedTextarea={expandedTextarea}
          setExpandedTextarea={setExpandedTextarea}
          firstTextareaRef={firstTextareaRef}
          secondTextareaRef={secondTextareaRef}
        />

        <BaseButtons
          handleGlobal={handleGlobal}
          handleTextGlobal={handleTextGlobal}
          handleTextInternally={handleTextInternally}
          textToReplace={textToReplace}
          replacementText={replacementText}
          setTextToReplace={setTextToReplace}
          setReplacementText={setReplacementText}
          handleEpoch={handleEpoch}
          downloadZipFromBase64={downloadZipFromBase64}
        />

        <Button handleClear={handleClear} handleCompare={handleCompare} />

        <OutputResult output={output} />

        {showDiv && (
          <div className="xml-compare-container">
            <ComparasionResult
              firstComparedOutput={firstComparedOutput}
              secondComparedOutput={secondComparedOutput}
            />
          </div>
        )}
      </div>

      <div className="footer-container">Internally Developed - For Internal Use - Version 2.0</div>
    </div>
  );
}

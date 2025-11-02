import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../constants/header-logo.png";
import InputDocuments from "../components/pdfPage/InputDocuments";
import DocumentsButtons from "../components/pdfPage/DocumentsButtons";
import OutputDocuments from "../components/pdfPage/OutputDocuments";
import "./DocumentsPage.css";
import TopNavigation from "../components/TopNavigation";

const DocumentsPage: React.FC = () => {
  const [output, setOutput] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState("result.pdf");
  const [darkMode, setDarkMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [splitFirstPage, setSplitFirstPage] = useState(1);
  const [splitLastPage, setSplitLastPage] = useState(1);

  const navigate = useNavigate();

  const handleGoToHome = () => navigate("/");

  const resetInputs = () => {
    setFileNames([]);
    setFiles([]);
    setOutput("");
    setDownloadUrl(null);
    setSplitFirstPage(1);
    setSplitLastPage(1);
    fileInputRef.current && (fileInputRef.current.value = "");
  };

  const handleConvert = () => {
    alert("Under development — please use SharePoint for now.");
  };

  const validatePdfFiles = (expectedCount: number): boolean => {
    if (files.length !== expectedCount) {
      alert(`Please select exactly ${expectedCount} PDF file(s).`);
      return false;
    }
    if (!files.every(f => f.name.endsWith(".pdf"))) {
      alert("Only PDF files are allowed.");
      return false;
    }
    return true;
  };

  const handleMerge = async () => {
    if (!validatePdfFiles(files.length)) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch("/DataToolbox/mergeFiles", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Merge failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setDownloadFilename("Merged.pdf");
      setOutput("Files merged successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Error merging PDFs");
    }
  };

  const handlePdfGlobal = async (action: string, successMessage: string) => {
    if (!validatePdfFiles(1)) return;

    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("firstPage", String(splitFirstPage));
    formData.append("lastPage", String(splitLastPage));

    try {
      const response = await fetch(`/DataToolbox/${action}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Action failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setOutput(successMessage);
      setDownloadFilename("result.pdf");
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    }
  };

  return (
    <div className={`App ${darkMode ? "dark-mode" : ""}`}>
      <div className="main-page-content">
        <header className="header-container">
          {logo != null && (
            <div className="logo-container">
              <img src={logo} alt="Logo" className="logo" />
            </div>
          )}
          <div
            className="title-container"
            title="Your all-in-one tool (PDF - DOCX) and more"
          >
            <h1 className="title">DataOps</h1>

          </div>
        </header>
        <TopNavigation
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
        <InputDocuments
          fileNames={fileNames}
          setFileNames={setFileNames}
          fileInputRef={fileInputRef}
          setFiles={setFiles}
          files={files}
        />

        <DocumentsButtons
          handleConvert={handleConvert}
          handleClear={resetInputs}
          handleMerge={handleMerge}
          handlePdfGlobal={handlePdfGlobal}
          splitFirstPage={splitFirstPage}
          setSplitFirstPage={setSplitFirstPage}
          splitLastPage={splitLastPage}
          setSplitLastPage={setSplitLastPage}
        />

        <OutputDocuments
          output={output}
          downloadUrl={downloadUrl}
          downloadFilename={downloadFilename}
        />

        <footer className="footer-container">
          Internally Developed - For Internal Use - Version 2.0
        </footer>
      </div>
    </div>
  );
};

export default DocumentsPage;

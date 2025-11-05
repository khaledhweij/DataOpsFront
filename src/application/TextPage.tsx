// pages/TextTools.tsx
import { useState } from 'react';
import './TextTools.css';

export default function TextTools() {
  const [content, setContent] = useState('');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [results, setResults] = useState('No results to display.');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [expandedTextarea, setExpandedTextarea] = useState(false);
  const [expandedResultTextarea, setExpandedResultTextarea] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const words = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;
  const chars = content.length;
  const lines = content ? content.split('\n').length : 0;

  const escapeRegExp = (str: string) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const regex = new RegExp(escapeRegExp(findText), "g");

  const toggleExpand = () => {
    setExpandedTextarea(!expandedTextarea);
  };

  const toggleExpandedResult = () => {
    setExpandedResultTextarea(!expandedResultTextarea);
  };

  const handleCursorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.target.selectionStart);
  };

  const handleUpperCase = () => {
    setResults(content.toUpperCase());
  };

  const handleLowerCase = () => {
    setResults(content.toLowerCase());
  };

  const handleTitleCase = () => {
    const result = content.replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
    setResults(result);
  };

  const handleNumberLines = () => {
    const result = content.split('\n').map((line, index) => `${index + 1}- ${line}`).join('\n');
    setResults(result);
  };

  const handleReplaceAll = () => {
    if (findText) {
      const result = content.replace(regex, replaceText);
      setResults(result);
    }
  };

  const handleLineBreaksAfter = () => {
    const result = content.replace(regex, findText + '\n');
    setResults(result);
  };

  const handleMergeLinesAfter = () => {
    const result = content.replace(new RegExp(`${escapeRegExp(findText)}\\s*\\n`, "g"), `${findText} `);
    setResults(result);
  };

  const handleRemoveCharacters = () => {
    if (findText) {
      const result = content.replace(regex, "");
      setResults(result);
    }
  };

  const handleTrimLines = () => {
    const result = content.split('\n').map(line => line.trim()).join('\n');
    setResults(result);
  };

  const handleMergeLines = () => {
    const result = content.split('\n').join(' ');
    setResults(result);
  };

  const handleTrimEmptyLines = () => {
    const result = content.split('\n').filter(line => line.trim()).join('\n');
    setResults(result);
  };

  const handleFileBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setContent(content);
      };
      reader.readAsText(file);
    }
  };

  const readFileContent = (file: File, callback: (content: string) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      callback(content);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readFileContent(file, setContent);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCopyResultToInput = () => {
    setContent(results);
  };

  const handleCopyResultToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(results);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000); // hide after 1s
    } catch (err) {
    }
  };

  const handleClear = () => {
    setContent('');
    setResults('No results to display.');
    setFindText('');
    setReplaceText('');
    setCursorPosition(0)
  };

  return (
    <div className="text-tools">
      <div className="card mb-3">
        <div className="card-header">
          <h2 className="card-title">Text Content</h2>
          <label className="btn btn-secondary">
            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Browse
            <input
              type="file"
              accept="*/*"
              style={{ display: 'none' }}
              onChange={handleFileBrowse}
            />
          </label>
        </div>
        <textarea
          className={expandedTextarea ? "textarea-expanded" : "textarea"}
          style={{ minHeight: '350px' }}
          placeholder="Enter Content (Alt + Z to expand)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onSelect={handleCursorChange}
          onKeyDown={(e) => {
            if (e.altKey && e.key === "z" || e.altKey && e.key === "Z") {
              e.preventDefault();
              toggleExpand();
            }
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        />
        <div className="stats">
          <small>
            📝 {words} words | {chars} chars | Cursor at {cursorPosition} | {lines} Lines

          </small>
        </div>
      </div>

      <div className="grid grid-3 mb-3">
        <div className="card">
          <h3 className="card-subtitle">Case Operations</h3>
          <div className="button-grid">
            <button className="btn btn-outline" onClick={handleUpperCase}>UPPERCASE</button>
            <button className="btn btn-outline" onClick={handleLowerCase}>lowercase</button>
            <button className="btn btn-outline" onClick={handleTitleCase}>TitleCase</button>
            <button className="btn btn-outline" onClick={handleNumberLines}>Number the Lines</button>
          </div>
        </div>

        <div className="card">
          <h3 className="card-subtitle">Text Manipulation</h3>
          <div className="button-grid">
            <button className="btn btn-outline" onClick={handleReplaceAll}>Replace All</button>
            <button className="btn btn-outline" onClick={handleLineBreaksAfter}>Line Breaks After</button>
            <button className="btn btn-outline" onClick={handleMergeLinesAfter}>Merge Lines After</button>
            <button className="btn btn-outline" onClick={handleRemoveCharacters}>Remove Characters</button>
          </div>
        </div>

        <div className="card">
          <h3 className="card-subtitle">Line Operations</h3>
          <div className="button-grid">
            <button className="btn btn-outline" onClick={handleTrimLines}>Trim All Lines</button>
            <button className="btn btn-outline" onClick={handleMergeLines}>Merge All Lines</button>
            <button className="btn btn-outline" onClick={handleTrimEmptyLines}>Trim Empty Lines</button>
            <button className="btn btn-primary" onClick={handleClear}>Clear All</button>
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <h3 className="card-subtitle">Find & Replace</h3>
        <div className="find-replace">
          <input
            type="text"
            className="input"
            placeholder="pattern to be replaced..."
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
          />
          <input
            type="text"
            className="input"
            placeholder="replacement pattern..."
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
          />
        </div>
      </div>


      <div className="card">
        <h3 className="card-subtitle">Results</h3>
        <textarea
          className={expandedResultTextarea ? "textarea-expanded" : "textarea"}
          readOnly
          value={results || ""}
          placeholder="No results to display."
          onKeyDown={(e) => {
            if (e.altKey && e.key === "z" || e.altKey && e.key === "Z") {
              e.preventDefault();
              toggleExpandedResult();
            }
          }}
        />
        <button className="btn btn-outline" onClick={handleCopyResultToInput} style={{ marginTop: '20px' }}>
          <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy to Input Text Content
        </button>

        <button className="btn btn-outline" onClick={handleCopyResultToClipboard} style={{ marginTop: '20px', marginLeft: '10px' }}>
          <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {isCopied ? "Copied!" : "Copy to clipboard"}
        </button>
      </div>

      <div className="footer-container">Internally Developed - For Internal Use - Version 3.0</div>
    </div>
  );
}
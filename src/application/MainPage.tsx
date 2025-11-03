// pages/NewMainPage.tsx
import { useState } from 'react';
import './MainPage.css';

export default function NewMainPage() {
  const [firstContent, setFirstContent] = useState('');
  const [secondContent, setSecondContent] = useState('');
  const [results, setResults] = useState('No results to display.');
  const [expandedTextarea1, setExpandedTextarea1] = useState(false);
  const [expandedTextarea2, setExpandedTextarea2] = useState(false);

  const toggleExpand1 = () => {
    setExpandedTextarea1(!expandedTextarea1);
  };

  const toggleExpand2 = () => {
    setExpandedTextarea2(!expandedTextarea2);
  };

  const readFileContent = (file: File, callback: (content: string) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      callback(content);
    };
    reader.readAsText(file);
  };

  const handleFirstFileBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readFileContent(file, setFirstContent);
    }
  };

  const handleSecondFileBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readFileContent(file, setSecondContent);
    }
  };

  const handleFirstDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readFileContent(file, setFirstContent);
    }
  };

  const handleSecondDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readFileContent(file, setSecondContent);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCompare = () => {
    if (firstContent === secondContent) {
      setResults('✓ Contents are identical');
    } else {
      setResults('✗ Contents are different');
    }
  };

  const handleCopyResultToFirstInput = () => {
    setFirstContent(results);
  };

  const handleCopyResultToSecondInput = () => {
    setSecondContent(results);
  };


  const handleClear = () => {
    setFirstContent('');
    setSecondContent('');
    setResults('No results to display.');
  };

  return (
    <div className="main-page">
      <div className="grid grid-cols-2">
        {/* Left Column */}
        <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">First Content</h2>
              <label className="btn btn-secondary">
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Browse
                <input
                  type="file"
                  accept="*/*"
                  style={{ display: 'none' }}
                  onChange={handleFirstFileBrowse}
                />
              </label>
            </div>
            <textarea
              className={expandedTextarea1 ? "textarea-expanded" : "textarea"}
              placeholder="Enter First Content (Alt + Z to expand) or drag & drop a file"
              value={firstContent}
              onChange={(e) => setFirstContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.altKey && e.key === "z") {
                  e.preventDefault();
                  toggleExpand1();
                }
              }}
              onDrop={handleFirstDrop}
              onDragOver={handleDragOver}
            />
          </div>

          <div className="card">
            <h3 className="card-subtitle">Encoding & Decoding</h3>
            <div className="button-grid button-grid-2">
              <button className="btn btn-outline">Decode</button>
              <button className="btn btn-outline">Encode</button>
              <button className="btn btn-outline">Decode JWT</button>
              <button className="btn btn-outline">Decode UUID</button>
              <button className="btn btn-outline">Decode URL</button>
              <button className="btn btn-outline">Encode URL</button>
              <button className="btn btn-outline">Decode EBCDIC</button>
              <button className="btn btn-outline">Encode EBCDIC</button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Second Content</h2>
              <label className="btn btn-secondary">
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Browse
                <input
                  type="file"
                  accept="*/*"
                  style={{ display: 'none' }}
                  onChange={handleSecondFileBrowse}
                />
              </label>
            </div>
            <textarea
              className={expandedTextarea2 ? "textarea-expanded" : "textarea"}
              placeholder="Enter Second Content (Alt + Z to expand) or drag & drop a file"
              value={secondContent}
              onChange={(e) => setSecondContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.altKey && e.key === "z") {
                  e.preventDefault();
                  toggleExpand2();
                }
              }}
              onDrop={handleSecondDrop}
              onDragOver={handleDragOver}
            />
          </div>

          <div className="card">
            <h3 className="card-subtitle">Utilities</h3>
            <div className="button-grid button-grid-2">
              <button className="btn btn-outline">Beautify</button>
              <button className="btn btn-outline">Decrypt</button>
              <button className="btn btn-outline">Validate</button>
              <button className="btn btn-outline">Convert</button>
              <button className="btn btn-outline">Epoch Converter</button>
              <button className="btn btn-outline">Decompress ZIP</button>
              <button className="btn btn-outline">View PDF</button>
              <button className="btn btn-outline">View HTML</button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-bar">
        <button className="btn btn-primary btn-large" onClick={handleCompare}>Compare</button>
        <button className="btn btn-secondary btn-large" onClick={handleClear}>Clear</button>
      </div>

      {/* Results */}
      <div className="card">
        <h3 className="card-subtitle">Results</h3>
        <div className="results-area">
          {results}
        </div>
        <button className="btn btn-outline" onClick={handleCopyResultToFirstInput} style={{ marginTop: '20px' }}>
          <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy to First Input Text Content
        </button>

        <button className="btn btn-outline" onClick={handleCopyResultToSecondInput} style={{ marginTop: '20px' , marginLeft: '10px' }}>
          <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy to Second Input Text Content
        </button>
      </div>
    </div>
  );
}
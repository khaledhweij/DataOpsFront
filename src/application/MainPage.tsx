// pages/MainPage.tsx
import { useState } from 'react';
import './MainPage.css';

export default function MainPage() {
  const [firstContent, setFirstContent] = useState('');
  const [secondContent, setSecondContent] = useState('');
  const [results, setResults] = useState('No results to display.');
  const [expandedTextarea1, setExpandedTextarea1] = useState(false);
  const [expandedTextarea2, setExpandedTextarea2] = useState(false);

  const handleCompare = () => {
    if (firstContent === secondContent) {
      setResults('✓ Contents are identical');
    } else {
      setResults('✗ Contents are different');
    }
  };

  const handleClear = () => {
    setFirstContent('');
    setSecondContent('');
    setResults('No results to display.');
  };

  const toggleExpand1 = () => {
    setExpandedTextarea1(!expandedTextarea1);
  };

    const toggleExpand2 = () => {
    setExpandedTextarea2(!expandedTextarea2);
  };


  return (
    <div className="main-page">
      <div className="grid grid-cols-2">
        {/* Left Column */}
        <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">First Content</h2>
              <button className="btn btn-secondary">
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Browse
              </button>
            </div>
            <textarea
              className={expandedTextarea1 ? "textarea-expanded" : "textarea"}
              placeholder="Enter First Content (Alt + Z to expand)"
              value={firstContent}
              onChange={(e) => setFirstContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.altKey && e.key === "z") {
                  e.preventDefault();
                  toggleExpand1();
                }
              }}
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
              <button className="btn btn-secondary">
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Browse
              </button>
            </div>
            <textarea
              className={expandedTextarea2 ? "textarea-expanded" : "textarea"}
              placeholder="Enter Second Content (Alt + Z to expand)"
              value={secondContent}
              onChange={(e) => setSecondContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.altKey && e.key === "z") {
                  e.preventDefault();
                  toggleExpand2();
                }
              }}
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
      </div>
      
      <div className="footer-container">Internally Developed - For Internal Use - Version 3.0</div>
    </div>
  );
}
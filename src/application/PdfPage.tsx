// pages/PdfTools.tsx
import { useState } from 'react';
import './PdfTools.css';

export default function PdfTools() {
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [results, setResults] = useState('No results to display.');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const handleClear = () => {
    setSelectedFiles(null);
    setFromPage(1);
    setToPage(1);
    setResults('No results to display.');
  };

  return (
    <div className="pdf-tools">
      <div className="card mb-3">
        <div className="card-header">
          <h2 className="card-title">PDF Documents</h2>
          <label className="btn btn-primary">
            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            Browse Files
            <input 
              type="file" 
              accept=".pdf" 
              multiple 
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </label>
        </div>
        <div className="file-upload-area">
          <svg className="file-upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
          <p className="file-upload-text">
            {selectedFiles ? `${selectedFiles.length} file(s) selected` : 'No files selected'}
          </p>
          <p className="file-upload-hint">Click Browse to select PDF files</p>
        </div>
      </div>

      <div className="button-grid button-grid-4 mb-3">
        <button className="btn btn-outline">Convert</button>
        <button className="btn btn-outline">Merge</button>
        <button className="btn btn-outline">Split</button>
        <button className="btn btn-outline">Extract</button>
      </div>

      <div className="card mb-3">
        <h3 className="card-subtitle">Page Range</h3>
        <div className="page-range">
          <div className="form-group">
            <label className="form-label">From Page</label>
            <input 
              type="number" 
              className="input-number" 
              value={fromPage}
              min="1"
              onChange={(e) => setFromPage(parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">To Page</label>
            <input 
              type="number" 
              className="input-number" 
              value={toPage}
              min="1"
              onChange={(e) => setToPage(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
      </div>

      <div className="action-bar">
        <button className="btn btn-secondary btn-large" onClick={handleClear}>Clear</button>
      </div>

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
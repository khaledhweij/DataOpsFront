// pages/PdfTools.tsx
import { useState } from 'react';
import './PdfTools.css';
import { PdfUtils } from '../functions/PdfUtils';

export default function PdfTools() {
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [results, setResults] = useState('No results to display.');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfResult, setPdfResult] = useState<Uint8Array | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string>('');

  const pdfOps = new PdfUtils();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUploadAreaClick = () => {
    document.getElementById('pdf-file-input')?.click();
  };

  const handleConvert = () => {
    alert("Coming soon!");
  }

  const handleMerge = async () => {
    if (!selectedFiles || selectedFiles.length < 2) {
      setResults('Please select at least 2 PDF files to merge.');
      return;
    }

    setIsProcessing(true);
    try {
      const mergedPdf = await pdfOps.mergePdfs(selectedFiles);
      setPdfResult(mergedPdf);
      setPdfFilename('merged.pdf');
      setResults(`✓ Successfully merged ${selectedFiles.length} PDFs`);
    } catch (error) {
      setResults(`✗ Error merging PDFs: ${error}`);
      setPdfResult(null);
    } finally {
      setIsProcessing(false);
    }
  };


  const handleRemove = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setResults('Please select a PDF file to remove pages from.');
      return;
    }

    if (fromPage > toPage) {
      setResults('✗ "From Page" must be less than or equal to "To Page"');
      return;
    }

    setIsProcessing(true);
    try {
      const file = selectedFiles[0];
      const { restPdf } = await pdfOps.removePages(file, fromPage, toPage);

      // Show the range PDF in results
      setPdfResult(restPdf);
      setPdfFilename(`pagesExtracted.pdf`);
      setResults(`✓ Successfully removed pages ${fromPage}-${toPage}`);
    } catch (error) {
      setResults(`✗ Error removing pages: ${error}`);
      setPdfResult(null);
    } finally {
      setIsProcessing(false);
    }
  };
  // Extract handler
  const handleExtract = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setResults('Please select a PDF file to extract pages from.');
      return;
    }

    if (fromPage > toPage) {
      setResults('✗ "From Page" must be less than or equal to "To Page"');
      return;
    }

    setIsProcessing(true);
    try {
      const file = selectedFiles[0];
      const extractedPdf = await pdfOps.extractPages(file, fromPage, toPage);
      setPdfResult(extractedPdf);
      setPdfFilename(`extracted_pages_${fromPage}-${toPage}.pdf`);
      setResults(`✓ Successfully extracted pages ${fromPage} to ${toPage}`);
    } catch (error) {
      setResults(`✗ Error extracting pages: ${error}`);
      setPdfResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download handler
  const handleDownloadPdf = () => {
    if (pdfResult) {
      pdfOps.downloadPdf(pdfResult, pdfFilename);
    }
  };

  // Show PDF in new window
  const handleShowPdf = () => {
    if (pdfResult) {
      const blob = new Blob([pdfResult], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };

  const handleClear = () => {
    setSelectedFiles([]);
    setFromPage(1);
    setToPage(1);
    setResults('No results to display.');
    setPdfResult(null);
  };

  return (
    <div className="pdf-tools">
      <div className="card mb-3">
        <div className="card-header">
          <h2 className="card-title">PDF Documents</h2>
          <label className="btn btn-primary">
            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Browse Files
            <input
              id="pdf-file-input"
              type="file"
              accept=".pdf"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
          </label>
        </div>

        <div
          className="file-upload-area"
          onClick={handleUploadAreaClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <svg className="file-upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="file-upload-text">
            {selectedFiles ? `${selectedFiles.length} file(s) selected` : 'No files selected'}
          </p>
          <p className="file-upload-hint">Click here or drag & drop PDF files</p>

          {selectedFiles && selectedFiles.length > 0 && (
            <div className="file-list">
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <svg className="file-item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="file-item-name">{file.name}</span>
                  <span className="file-item-size">{(file.size / 1024).toFixed(1)} KB</span>
                  <button
                    className="file-item-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                    title="Remove file"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="button-grid button-grid-4 mb-3">
        <button className="btn btn-outline" onClick={handleConvert}>Convert</button>
        <button
          className="btn btn-outline"
          onClick={handleMerge}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Merge'}
        </button>
        <button
          className="btn btn-outline"
          onClick={handleExtract}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Extract'}
        </button>
        <button
          className="btn btn-outline"
          onClick={handleRemove}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Remove'}
        </button>
      </div>

      <div className="card mb-3">
        <h3 className="card-subtitle">Page Range</h3>
        <div className="page-range">
          <div className="form-group">
            <label className="form-label">From Page</label>
            <input
              type="number"
              className="input-number"
              value={fromPage === 0 ? '' : fromPage}
              min="1"
              placeholder="1"
              onChange={(e) => {
                const value = e.target.value;
                const newFromPage = value === '' ? 0 : parseInt(value) || 0;
                setFromPage(newFromPage);

                // Auto-update toPage only if it's less than fromPage + 1
                if (newFromPage > 0 && toPage > 0 && toPage <= newFromPage) {
                  setToPage(newFromPage + 1);
                }
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">To Page</label>
            <input
              type="number"
              className="input-number"
              value={toPage === 0 ? '' : toPage}
              min={fromPage > 0 ? fromPage + 1 : 1}
              placeholder={fromPage > 0 ? String(fromPage + 1) : "1"}
              onChange={(e) => {
                const value = e.target.value;
                setToPage(value === '' ? 0 : parseInt(value) || 0);
              }}
            />
          </div>
        </div>
      </div>

      <div className="action-bar">
        <button className="btn btn-secondary btn-large" style={{ marginTop: '-1rem' }} onClick={handleClear}>Clear</button>
      </div>

      <div className="card">
        <h3 className="card-subtitle">Results</h3>
        {pdfResult ? (
          <div>
            <div className="results-area">
              {results}
            </div>
            <div className="result-buttons">
              <button className="btn btn-primary" onClick={handleDownloadPdf}>
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </button>
              <button className="btn btn-outline" onClick={handleShowPdf}>
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Show PDF
              </button>
            </div>
          </div>
        ) : (
          <div className="results-area">
            {results}
          </div>
        )}
      </div>

      <div className="footer-container">Open Source - Licensed under MIT License - Version 1.0</div>
    </div>
  );
}
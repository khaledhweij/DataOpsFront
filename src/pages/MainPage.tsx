// pages/NewMainPage.tsx
import { useEffect, useState } from 'react';
import './MainPage.css';
import { autoBeautify, autoValidate, backendApiHandler, decodeBase64, decodeJwt, decodeUrl, performEncryption, convertJsonOrToon, encodeBase64, encodeUrl, escapeJson, unescapeJson } from '../functions/MainUtils';
import { downloadZipFromBase64, viewHtmlFromBase64, viewPdfFromBase64 } from '../services/fileService';
import { convertToEpoch } from '../services/dateService';
import TextComparator, { ComparisonResult } from '../functions/TextComparator';
import { AlgorithmPopup } from '../components/AlgorithmPopup';

export default function NewMainPage() {
  const [firstContent, setFirstContent] = useState('');
  const [secondContent, setSecondContent] = useState('');
  const [results, setResults] = useState('No results to display.');
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [expandedTextarea1, setExpandedTextarea1] = useState(false);
  const [expandedTextarea2, setExpandedTextarea2] = useState(false);
  const [expandedResultTextarea, setExpandedResultTextarea] = useState(false);
  const [expandedLeftComparisonResultArea, setExpandedLeftComparisonResultArea] = useState(false);
  const [expandedRightComparisonResultArea, setExpandedRightComparisonResultArea] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [lastFocusedTextarea, setLastFocusedTextarea] = useState<'first' | 'second' | null>(null);
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);
  const [showEncryptPopup, setShowEncryptPopup] = useState(false);
  const [algorithm, setAlgorithm] = useState("");
  const [currentDiffIndex, setCurrentDiffIndex] = useState(0);
  const [totalDiffs, setTotalDiffs] = useState({ left: 0, right: 0 });

  const comparator = new TextComparator();

  const toggleExpand1 = () => {
    setExpandedTextarea1(!expandedTextarea1);
  };

  const toggleExpand2 = () => {
    setExpandedTextarea2(!expandedTextarea2);
  };

  const toggleExpandedResult = () => {
    setExpandedResultTextarea(!expandedResultTextarea);
  };


  const toggleExpandedRightComparisonResult = () => {
    setExpandedRightComparisonResultArea(!expandedRightComparisonResultArea);
  };

    const toggleExpandedLeftComparisonResult = () => {
    setExpandedLeftComparisonResultArea(!expandedLeftComparisonResultArea);
  };

  const handleEncryptClick = () => {
    setShowEncryptPopup(true);
  };

  useEffect(() => {
    if (comparisonResult) {
      // Count differences
      const leftDiffs = comparisonResult.formattedText1.match(/<span[^>]*class="diff-removed"/g)?.length || 0;
      const rightDiffs = comparisonResult.formattedText2.match(/<span[^>]*class="diff-added"/g)?.length || 0;
      setTotalDiffs({ left: leftDiffs, right: rightDiffs });
      setCurrentDiffIndex(0);
    }
  }, [comparisonResult]);

  // Navigate to next difference
  const goToNextDiff = (side: 'left' | 'right') => {
    const container = side === 'left'
      ? document.querySelector('.comparison-column:first-child .comparison-content')
      : document.querySelector('.comparison-column:last-child .comparison-content');

    if (!container) return;

    const diffClass = side === 'left' ? 'diff-removed' : 'diff-added';
    const diffs = container.querySelectorAll(`span[style*="${side === 'left' ? '#e74c3c' : '#2ecc71'}"]`);

    if (diffs.length === 0) return;

    const nextIndex = (currentDiffIndex + 1) % diffs.length;
    setCurrentDiffIndex(nextIndex);

    // Scroll to the difference
    const targetDiff = diffs[currentDiffIndex] as HTMLElement;
    targetDiff.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Highlight briefly
    targetDiff.style.backgroundColor = side === 'left' ? 'rgba(231, 76, 60, 0.3)' : 'rgba(46, 204, 113, 0.3)';
    setTimeout(() => {
      targetDiff.style.backgroundColor = '';
    }, 1000);
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
    if (!firstContent && !secondContent) {
      setResults('Please enter content to compare.');
      setComparisonResult(null);
      return;
    }

    if (firstContent === secondContent) {
      setResults('✓ Contents are identical');
    } else {


      const result = comparator.compare(firstContent, secondContent);
      setComparisonResult(result);

      if (result.hasDifferences) {
        setResults(`Found ${result.additions} additions and ${result.deletions} deletions`);
      } else {
        setResults('✓ Contents are identical');
      }
    }
  };

  const handleCopyResultToFirstInput = () => {
    setFirstContent(results);
  };

  const handleCopyResultToSecondInput = () => {
    setSecondContent(results);
  };

  const handleCopyResultToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(results);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000); // hide after 1s
    } catch (err) {
    }
  };

  const getFilteredComparison = () => {
    if (!comparisonResult || !showOnlyDifferences) return comparisonResult;

    // Extract only the colored parts (removed/added), skip unchanged (var(--text-tertiary))
    const parser = new DOMParser();

    const doc1 = parser.parseFromString(comparisonResult.formattedText1, 'text/html');
    const spans1 = doc1.querySelectorAll('span');
    let filteredText1 = '';
    spans1.forEach(span => {
      const style = span.getAttribute('style') || '';
      if (style.includes('#e74c3c')) { // Only deletions (red)
        filteredText1 += span.outerHTML;
      }
    });

    const doc2 = parser.parseFromString(comparisonResult.formattedText2, 'text/html');
    const spans2 = doc2.querySelectorAll('span');
    let filteredText2 = '';
    spans2.forEach(span => {
      const style = span.getAttribute('style') || '';
      if (style.includes('#2ecc71')) { // Only additions (green)
        filteredText2 = filteredText2 + span.outerHTML + '\n';
      }
    });

    return {
      ...comparisonResult,
      formattedText1: comparisonResult.formattedText1OnlyDiffs,
      formattedText2: comparisonResult.formattedText2OnlyDiffs
    };
  };

  const getContent = () => {
    if (lastFocusedTextarea === 'first') {
      return firstContent;
    } else if (lastFocusedTextarea === 'second') {
      return secondContent;
    }
    return firstContent;
  };

  const handleBeautify = () => {
    try {
      const content = getContent();
      const beautified = autoBeautify(content);
      setResults(beautified);
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleValidate = () => {
    const content = getContent();
    const result = autoValidate(content);
    alert(`${result.type}: ${result.message}`);
  };

  const handleEncrypt = (selectedAlgorithm: string) => {
    try {
      setShowEncryptPopup(false);
      setAlgorithm(selectedAlgorithm);

      const content = getContent();
      const output = performEncryption(content, selectedAlgorithm);
      setResults(output);
    } catch (error) {
      alert((error as Error).message);
    }
  };


  const handleComingSoon = () => {
    try {
      alert("Coming soon!");
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleToonJson = () => {
    try {
      const content = getContent();
      const output = convertJsonOrToon(content);
      setResults(output);
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleEpochConvert = () => {
    try {
      const content = getContent();
      const converted = convertToEpoch(content);
      setResults(converted);
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleDecompressZip = () => {
    try {
      const content = getContent();
      if (content.trim() === "") {
        setResults("Content cannot be empty");
      } else {
        downloadZipFromBase64(content);
      }
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleViewPdf = () => {
    try {
      const content = getContent();
      if (content.trim() === "") {
        setResults("Content cannot be empty");
      } else {
        viewPdfFromBase64(content);
      }

    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleViewHtml = () => {
    try {
      const content = getContent();
      if (content.trim() === "") {
        setResults("Content cannot be empty");
      } else {
        viewHtmlFromBase64(content);
      }
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleDecode = () => {
    try {
      const content = getContent();
      const decoded = decodeBase64(content);
      setResults(decoded);
    } catch (error) {
      alert((error as Error).message);
    }
  };



  const handleEncode = () => {
    try {
      const content = getContent();
      const encoded = encodeBase64(content);
      setResults(encoded);
    } catch (error) {
      alert((error as Error).message);
    }
  };



  const handleDecodeJwt = () => {
    try {
      const content = getContent();
      const decodedJwt = decodeJwt(content);
      setResults(decodedJwt);
    } catch (error) {
      alert((error as Error).message);
    }
  };


  const handleDecodeUuid = () => {
    try {

      const content = getContent();
      backendApiHandler("decodeUUID", content, true).then((result: string) => {
        setResults(result);
      });

    } catch (error) {
      alert((error as Error).message);
    }
  }


  const handleDecodeUrl = () => {
    try {
      const content = getContent();
      const decodedUrl = decodeUrl(content);
      setResults(decodedUrl);
    } catch (error) {
      alert((error as Error).message);
    }
  };


  const handleEncodeUrl = () => {
    try {
      const content = getContent();
      const encodedUrl = encodeUrl(content);
      setResults(encodedUrl);
    } catch (error) {
      alert((error as Error).message);
    }
  };

    const handleEscapeJson = () => {
    try {
      const content = getContent();
      const escapedJson = escapeJson(content);
      setResults(escapedJson);
    } catch (error) {
      alert((error as Error).message);
    }
  };

    const handleUnescapeJson = () => {
    try {
      const content = getContent();
      const unescapedJson = unescapeJson(content);
      setResults(unescapedJson);
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleClear = () => {
    setFirstContent('');
    setSecondContent('');
    setResults('No results to display.');
    setComparisonResult(null);
    setLastFocusedTextarea(null);
  };

  return (
    <div className="main-page">
      <div className="grid grid-cols-2">
        {/* Left Column */}
        <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className={`card ${lastFocusedTextarea === 'first' ? 'card-focused' : ''}`}>
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
                if (e.altKey && e.key === "z" || e.altKey && e.key === "Z") {
                  e.preventDefault();
                  toggleExpand1();
                }
              }}
              onDrop={handleFirstDrop}
              onDragOver={handleDragOver}
              onFocus={() => setLastFocusedTextarea('first')}
            />
          </div>

          <div className="card">
            <h3 className="card-subtitle">Encoding & Decoding</h3>
            <div className="button-grid button-grid-2">
              <button className="btn btn-outline" onClick={handleDecode} title="Decode Base64">Decode</button>
              <button className="btn btn-outline" onClick={handleEncode} title="Encode Base64">Encode</button>
              <button className="btn btn-outline" onClick={handleDecodeJwt} >Decode JWT</button>
              <button className="btn btn-outline" onClick={handleComingSoon}>Decode UUID</button>
              <button className="btn btn-outline" onClick={handleDecodeUrl}>Decode URL</button>
              <button className="btn btn-outline" onClick={handleEncodeUrl}>Encode URL</button>
              <button className="btn btn-outline" onClick={handleEscapeJson}>Escape JSON</button>
              <button className="btn btn-outline" onClick={handleUnescapeJson}>Unescape JSON</button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className={`card ${lastFocusedTextarea === 'second' ? 'card-focused' : ''}`}>
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
                if (e.altKey && e.key === "z" || e.altKey && e.key === "Z") {
                  e.preventDefault();
                  toggleExpand2();
                }
              }}
              onDrop={handleSecondDrop}
              onDragOver={handleDragOver}
              onFocus={() => setLastFocusedTextarea('second')}
            />
          </div>

          <div className="card">
            <h3 className="card-subtitle">Utilities</h3>
            <div className="button-grid button-grid-2">
              <button className="btn btn-outline" onClick={handleBeautify} title="XML, JSON, StackTrace">Beautify</button>
              <button className="btn btn-outline" onClick={handleEncryptClick}>Encrypt</button>
              {showEncryptPopup && (
                <AlgorithmPopup
                  onSelect={handleEncrypt}
                  onClose={() => setShowEncryptPopup(false)}
                />
              )}
              <button className="btn btn-outline" onClick={handleValidate}>Validate</button>
              <button className="btn btn-outline" onClick={handleToonJson}>TOON - JSON</button>
              <button className="btn btn-outline" onClick={handleEpochConvert}>Epoch Converter</button>
              <button className="btn btn-outline" onClick={handleDecompressZip} title="Base64 ZIP">Decompress ZIP</button>
              <button className="btn btn-outline" onClick={handleViewPdf} title="Base64 PDF">View PDF</button>
              <button className="btn btn-outline" onClick={handleViewHtml} title="Base64 HTML">View HTML</button>
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

        {comparisonResult ? (
          <div className="comparison-results">
            {/* Action Buttons */}
            <div className="comparison-actions">
              <button
                className="btn btn-outline"
                onClick={() => setShowOnlyDifferences(!showOnlyDifferences)}
              >
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {showOnlyDifferences ? 'Show All' : 'Only Differences'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setComparisonResult(null);
                  setShowOnlyDifferences(false);
                  setCurrentDiffIndex(0);

                }}
              >
                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close Comparison
              </button>
            </div>

            {/* Stats Summary */}
            <div className="comparison-stats">
              <div className="stat-card stat-similarity">
                <div className="stat-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{comparisonResult.similarityPercentage}%</div>
                  <div className="stat-label">Similarity</div>
                </div>
              </div>

              <div className="stat-card stat-additions">
                <div className="stat-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{comparisonResult.additions}</div>
                  <div className="stat-label">Additions</div>
                </div>
              </div>

              <div className="stat-card stat-deletions">
                <div className="stat-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-value">{comparisonResult.deletions}</div>
                  <div className="stat-label">Deletions</div>
                </div>
              </div>
            </div>

            {/* Side by Side Comparison */}
            <div className="comparison-container">
              <div className="comparison-column">
                <div className="comparison-header">
                  <svg className="comparison-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Original (Deletions in Red)</span>
                </div>
                {comparisonResult.deletions > 0 && (
                  <button
                    className="btn-nav"
                    onClick={() => goToNextDiff('left')}
                    title="Next difference"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                    Next
                  </button>
                )}
                <div
                  className={expandedLeftComparisonResultArea ? "textarea-expanded" : "comparison-content"}
                  tabIndex={0}
                  title="(Alt + Z to expand)"
                  onKeyDown={(e) => {
                    if (e.altKey && e.key === "z" || e.altKey && e.key === "Z") {
                      e.preventDefault();
                      toggleExpandedLeftComparisonResult();
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: getFilteredComparison()?.formattedText1 || '' }}
                />
              </div>

              <div className="comparison-divider"></div>

              <div className="comparison-column">
                <div className="comparison-header">
                  <svg className="comparison-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span>Modified (Additions in Green)</span>
                </div>
                {comparisonResult.additions > 0 && (
                  <button
                    className="btn-nav"
                    onClick={() => goToNextDiff('right')}
                    title="Next difference"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                    Next
                  </button>
                )}
                <div
                  className={expandedRightComparisonResultArea ? "comparison-content-expanded" : "comparison-content"}
                  tabIndex={0}
                  title="(Alt + Z to expand)"
                  onKeyDown={(e) => {
                    if (e.altKey && e.key === "z" || e.altKey && e.key === "Z") {
                      e.preventDefault();
                      toggleExpandedRightComparisonResult();
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: getFilteredComparison()?.formattedText2 || '' }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <textarea
              className={expandedResultTextarea ? "textarea-expanded" : "textarea"}
              readOnly
              value={results || ""}
              placeholder="No results to display."
              title="Result (Alt + Z to expand)"
              onKeyDown={(e) => {
                if (e.altKey && e.key === "z" || e.altKey && e.key === "Z") {
                  e.preventDefault();
                  toggleExpandedResult();
                }
              }}
            />
            <button className="btn btn-outline" onClick={handleCopyResultToFirstInput} style={{ marginTop: '20px', marginLeft: '10px' }}>
              <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to First Input Text Content
            </button>

            <button className="btn btn-outline" onClick={handleCopyResultToSecondInput} style={{ marginTop: '20px', marginLeft: '10px' }}>
              <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy to Second Input Text Content
            </button>

            <button className="btn btn-outline" onClick={handleCopyResultToClipboard} style={{ marginTop: '20px', marginLeft: '10px' }}>
              <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {isCopied ? "Copied!" : "Copy to clipboard"}
            </button>
          </div>
        )}
      </div>
      <div className="footer-container">Open Source - Licensed under MIT License - Version 1.0</div>
    </div>
  );
}
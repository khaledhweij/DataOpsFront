import React from "react";
import "./OutputDocuments.css";

interface OutputDocumentProps {
  output: string | null;
  downloadUrl: string | null;
  downloadFilename: string;
}

const OutputDocument: React.FC<OutputDocumentProps> = ({
  output,
  downloadUrl,
  downloadFilename
}) => {
  const handleDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = downloadFilename;
    link.click();
  };

  const handleShowFile = () => {
    if (!downloadUrl) return;
    window.open(downloadUrl, "_blank");
  };

  return (
    <div>
      <div className="documents-display-box">
        {output ? (
          <pre className="document-output-result">{output}</pre>
        ) : (
          <p className="documents-result-text">No results to display.</p>
        )}
      </div>

      {downloadUrl && (
        <div className="documents-results-buttons">
          <button className="download-document-button" onClick={handleDownload}>
            Download Result
          </button>
          <button className="download-document-button" onClick={handleShowFile}>
            Show Result
          </button>
        </div>
      )}
    </div>
  );
};

export default OutputDocument;

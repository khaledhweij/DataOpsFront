import React from "react";
import "./DocumentsButtons.css";

interface DocumentsButtonsProps {
  handleConvert: () => void;
  handleClear: () => void;
  handleMerge: () => void;
  handlePdfGlobal: (action: string, outputMessage: string) => void;
  splitFirstPage: number;
  setSplitFirstPage: React.Dispatch<React.SetStateAction<number>>;
  splitLastPage: number;
  setSplitLastPage: React.Dispatch<React.SetStateAction<number>>;
}

const DocumentsButtons: React.FC<DocumentsButtonsProps> = ({
  handleConvert,
  handleClear,
  handleMerge,
  handlePdfGlobal,
  splitFirstPage,
  setSplitFirstPage,
  splitLastPage,
  setSplitLastPage,
}) => {
  return (
    <div className="documents-buttons-container">
      <div className="documents-buttons-group">
        <button className="primary-button" onClick={handleConvert}>Convert</button>
        <button className="primary-button" onClick={handleMerge}>Merge</button>
        <button className="primary-button" onClick={() => handlePdfGlobal("splitPdf", "File has been split.")}>Split</button>
        <button className="primary-button" onClick={() => handlePdfGlobal("removePdfPages", "Pages extracted successfully.")}>Extract</button>
        <button className="clear-button" onClick={handleClear}>Clear</button>
      </div>

      <div className="documents-page-inputs">
        <label>
          From Page:
          <input
            type="number"
            value={splitFirstPage}
            min={1}
            onChange={(e) => setSplitFirstPage(Number(e.target.value))}
          />
        </label>

        <label>
          To Page:
          <input
            type="number"
            value={splitLastPage}
            min={1}
            onChange={(e) => setSplitLastPage(Number(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
};

export default DocumentsButtons;

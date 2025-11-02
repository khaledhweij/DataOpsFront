import React from "react";
import "./InputDocuments.css";

interface InputDocumentProps {
  fileNames: string[];
  setFileNames: React.Dispatch<React.SetStateAction<string[]>>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  files: File[];
}

const InputDocument: React.FC<InputDocumentProps> = ({
  fileNames,
  setFileNames,
  fileInputRef,
  setFiles,
}) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files ? Array.from(e.target.files) : [];
    const names = uploadedFiles.map(file => file.name);

    setFileNames(prev => [...prev, ...names]);
    setFiles(prev => [...prev, ...uploadedFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (nameToRemove: string) => {
    setFileNames(prev => prev.filter(name => name !== nameToRemove));
    setFiles(prev => prev.filter(file => file.name !== nameToRemove));
  };

  return (
    <div className="container">
      <input
        className="input-document-button"
        type="file"
        multiple
        onChange={handleFileUpload}
        ref={fileInputRef}
      />

      <div className="documents-display-box">
        {fileNames.length === 0 ? (
          <p className="placeholder-text">No files selected</p>
        ) : (
          fileNames.map((name, index) => (
            <div className="document-group" key={index}>
              <span className="document-name-text">{name}</span>
              <button
                className="remove-document-button"
                onClick={() => handleRemoveFile(name)}
                aria-label="Remove document"
              >
                ❌ 
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InputDocument;

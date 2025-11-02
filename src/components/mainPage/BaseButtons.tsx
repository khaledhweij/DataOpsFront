import React, { useEffect } from "react";
import "./BaseButtons.css";

export type BaseButtonsProps = {
  handleGlobal: (action: string, validate: boolean) => void;
  handleTextGlobal: (
    action: string,
    search: string,
    replacement: string
  ) => void;
  handleTextInternally: (action: string) => void;
  handleEpoch: () => void;
  downloadZipFromBase64: () => void;
  textToReplace: string;
  replacementText: string;
  setTextToReplace: (value: string) => void;
  setReplacementText: (value: string) => void;
};

const BaseButtons: React.FC<BaseButtonsProps> = ({
  handleGlobal,
  handleTextGlobal,
  handleTextInternally,
  textToReplace,
  replacementText,
  setTextToReplace,
  setReplacementText,
  handleEpoch,
  downloadZipFromBase64,
}) => {
  
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (!e.altKey) return;

      const key = e.key.toLowerCase();
      const actionMap: Record<string, () => void> = {
        e: () => handleGlobal("encode", false),
        d: () => handleGlobal("decode", false),
        y: () => handleGlobal("decrypt", false),
        u: () => handleGlobal("decodeURL", false),
        j: () => handleGlobal("decodeJWT", false),
        i: () => handleGlobal("decodeUUID", false),
        b: () => handleGlobal("beautify", false),
        v: () => handleGlobal("validate", true),
        p: () => handleGlobal("showPdf", false),
        h: () => handleGlobal("showHtml", false),
      };

      if (actionMap[key]) {
        e.preventDefault();
        actionMap[key]();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [handleGlobal]);

  return (
    <div className="base-buttons-container">

      {/* 🔹 Decode / Encode Buttons */}
      <div className="base-buttons-group">
        <div className="base-buttons-subgroup">
          <button type="button" className="base-button" onClick={() => handleGlobal("decode", false)}>
            Decode
          </button>
          <button type="button" className="base-button" onClick={() => handleGlobal("encode", false)}>
            Encode
          </button>
          <button type="button" className="base-button" onClick={() => handleGlobal("decodeJWT", false)}>
            Decode JWT
          </button>
          <button type="button" className="base-button" onClick={() => handleGlobal("decodeUUID", false)}>
            Decode UUID
          </button>
          <button type="button" className="base-button" onClick={() => handleGlobal("decodeURL", false)}>
            Decode URL
          </button>
          <button type="button" className="base-button" onClick={() => handleGlobal("encodeURL", false)}>
            Encode URL
          </button>
          <button type="button" className="base-button" onClick={() => handleGlobal("decodeEBCDIC", false)}>
            Decode EBCDIC
          </button>
          <button type="button" className="base-button" onClick={() => handleGlobal("encodeEBCDIC", false)}>
            Encode EBCDIC
          </button>
        </div>
      </div>

      {/* 🔹 Beautify / Validate / Convert */}
      <div className="base-buttons-group">
        <div className="base-buttons-subgroup">
          <button type="button" className="base-button" onClick={() => handleGlobal("beautify", false)}>
            Beautify
          </button>
          <button type="button" className="base-button" onClick={() => handleGlobal("decrypt", false)}>
            Decrypt
          </button>
          <button type="button" className="base-button" onClick={() => handleGlobal("validate", true)}>
            Validate
          </button>
          <button type="button" className="base-button" onClick={() => handleGlobal("convert", false)}>
            Convert
          </button>
          <button type="button" className="base-button" onClick={handleEpoch}>
            Epoch Converter
          </button>
          <button type="button" className="base-button" onClick={downloadZipFromBase64}>
            Decompress ZIP
          </button>
          <button type="button" className="base-button" onClick={() => handleGlobal("showPdf", false)}>
            View PDF
          </button>
          <button type="button" className="base-button" onClick={() => handleGlobal("showHtml", false)}>
            View HTML
          </button>
        </div>
      </div>

    </div>
  );
};

export default BaseButtons;

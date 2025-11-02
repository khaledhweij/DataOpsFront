import React, { useEffect } from "react";
import "./TextBaseButtons.css";

export type TextBaseButtonsProps = {
  handleText: (
    action: string,
    search: string,
    replacement: string
  ) => void;
  handleTextInternally: (action: string) => void;
  handleLines: (action: string) => void;
  textToReplace: string;
  replacementText: string;
  setTextToReplace: (value: string) => void;
  setReplacementText: (value: string) => void;
  handleClear: () => void;
};

const TextBaseButtons: React.FC<TextBaseButtonsProps> = ({
  handleText,
  handleTextInternally,
  handleLines,
  textToReplace,
  replacementText,
  setTextToReplace,
  setReplacementText,
  handleClear,
}) => {

  return (
    <div>
      <div className="text-base-buttons-container">
        <div className="text-base-buttons-group">
          <div className="text-base-buttons-subgroup">
            <button type="button" className="text-base-button" onClick={() => handleTextInternally("upperCase")}>
              UPPERCASE
            </button>
            <button type="button" className="text-base-button" onClick={() => handleTextInternally("lowerCase")}>
              lowercase
            </button>
            <button type="button" className="text-base-button" onClick={() => handleTextInternally("titleCase")}>
              TitleCase
            </button>
            <button type="button" className="text-base-button" onClick={() => handleTextInternally("sentenceCase")}>
              Sentence case
            </button>
          </div>
        </div>

        <div className="text-base-buttons-group">
          <div className="text-base-buttons-subgroup">
            <button
              type="button"
              className="text-base-button"
              title="Fill both 'pattern to be replaced' and 'replacement pattern' fields"
              onClick={() => handleText("replaceAll", textToReplace, replacementText)}
            >
              Replace All
            </button>

            <button
              type="button"
              className="text-base-button"
              title="Fill 'pattern to be replaced' field"
              onClick={() => handleText("lineBreaksAfter", textToReplace, "")}
            >
              Line Breaks After
            </button>

            <button
              type="button"
              className="text-base-button"
              title="Fill 'pattern to be replaced' field"
              onClick={() => handleText("mergeLinesAfter", textToReplace, "")}
            >
              Merge Lines After
            </button>

            <button
              type="button"
              className="text-base-button"
              title="Fill 'pattern to be replaced' field"
              onClick={() => handleText("removeCharacters", textToReplace, "")}
            >
              Remove Characters
            </button>
          </div>
        </div>

        <div className="text-base-buttons-group">
          <div className="text-base-buttons-subgroup">
            <button type="button" className="text-base-button" onClick={() => handleLines("trimAllLines")}>
              Trim All Lines
            </button>
            <button type="button" className="text-base-button" onClick={() => handleLines("mergeAllLines")}>
              Merge All Lines
            </button>
            <button type="button" className="text-base-button" onClick={() => handleLines("trimEmptyLines")}>
              Trim Empty Lines
            </button>
            <button type="button" className="clear-text-base-button" onClick={() => handleClear()}>
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="text-input-group">
        <input
          type="text"
          value={textToReplace}
          onChange={(e) => setTextToReplace(e.target.value)}
          placeholder="pattern to be replaced..."
          className="text-input"
        />
        <input
          type="text"
          value={replacementText}
          onChange={(e) => setReplacementText(e.target.value)}
          placeholder="replacement pattern..."
          className="text-input"
        />
      </div>
    </div>

  );
};

export default TextBaseButtons;

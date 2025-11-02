import React from "react";
import "./OutputResult.css";

export type OutputResultProps = {
  output: string;
};

const OutputResult: React.FC<OutputResultProps> = ({ output }) => {
  return (
    <div className="output-result-container">
      <div className="output-result-group">
        <textarea
          className="output-result"
          readOnly
          value={output || ""}
          placeholder="No results to display."
        />
      </div>
    </div>
  );
};

export default OutputResult;

import React, { useEffect, useMemo, useState } from "react";
import "./ComparasionResult.css";

export interface ComparasionResultProps {
  firstComparedOutput: string;
  secondComparedOutput: string;
}

const ComparasionResult: React.FC<ComparasionResultProps> = ({
  firstComparedOutput,
  secondComparedOutput,
}) => {
// 


  return (
    <div className="compare-xml-group">
      <div className="compare-xml-container">
        <div className="scroll-container">
          <div
            className="compare-xml-html"
            dangerouslySetInnerHTML={{ __html: firstComparedOutput }}
          />
        </div>

        <div className="scroll-container">
          <div
            className="compare-xml-html"
            dangerouslySetInnerHTML={{ __html: secondComparedOutput }}
          />
        </div>
      </div>
    </div>
  );
};

export default ComparasionResult;

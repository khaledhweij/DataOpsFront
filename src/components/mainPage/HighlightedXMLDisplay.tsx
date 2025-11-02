import React, { useEffect, useMemo, useState } from "react";
import "./HighlightedXMLDisplay.css";

export interface HighlightedXMLDisplayProps {
  firstComparedOutput: string;
  secondComparedOutput: string;
}

const HighlightedXMLDisplay: React.FC<HighlightedXMLDisplayProps> = ({
  firstComparedOutput,
  secondComparedOutput,
}) => {
  const highlightXml = (xml: string): string => {
    if (!xml) return "";

    let safeXml = xml
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    safeXml = safeXml.replace(
      /&lt;Highlight&gt;([\s\S]*?)&lt;\/Highlight&gt;/g,
      `<span class="highlight-xml">$1</span>`
    );

    return safeXml;
  };

  const highlightedFirstXml = useMemo(
    () => highlightXml(firstComparedOutput),
    [firstComparedOutput]
  );

  const highlightedSecondXml = useMemo(
    () => highlightXml(secondComparedOutput),
    [secondComparedOutput]
  );

  return (
    <div className="compare-xml-group">
      <div className="compare-xml-container">
        <div className="scroll-container">
          <div
            className="compare-xml-html"
            dangerouslySetInnerHTML={{ __html: highlightedFirstXml }}
          />
        </div>

        <div className="scroll-container">
          <div
            className="compare-xml-html"
            dangerouslySetInnerHTML={{ __html: highlightedSecondXml }}
          />
        </div>
      </div>
    </div>
  );
};

export default HighlightedXMLDisplay;

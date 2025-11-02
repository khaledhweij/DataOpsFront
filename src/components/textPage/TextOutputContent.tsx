import React from "react";
import "./TextOutputContent.css";

export type TextOutputContentProps = {
    output: string;
    copyOutputToInput?: () => void;
};

const TextOutputContent: React.FC<TextOutputContentProps> = ({ output, copyOutputToInput }) => {
    return (
        <div className="text-output-content-container">
            <div className="text-output-content-group">
                <textarea
                    className="text-output-content"
                    readOnly
                    value={output || ""}
                    placeholder="No results to display."
                />

                {output && output.trim().length > 0 && (
                        <button type="button" className="text-output-copy-button" onClick={copyOutputToInput}>
                            Copy Output to Input
                        </button>
                )}
            </div>
        </div>
    );
};

export default TextOutputContent;

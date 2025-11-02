import React from "react";
import "./Buttons.css";

export type ButtonsProps = {
  handleCompare: () => void;
  handleClear: () => void;
};

const Buttons: React.FC<ButtonsProps> = ({ handleCompare, handleClear }) => {
  return (
    <div className="button-group">
      <button type="button" className="compare-button" onClick={handleCompare}>
        Compare
      </button>
      <button type="button" className="clear-button" onClick={handleClear}>
        Clear
      </button>
    </div>
  );
};

export default Buttons;

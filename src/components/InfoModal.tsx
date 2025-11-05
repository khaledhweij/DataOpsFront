import React from "react";
import "./InfoModal.css";

interface InfoModalProps {
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <h2>DataOps</h2>

      <p>
        <strong>DataOps</strong> is your all-in-one internal platform for handling, transforming,
        and analyzing data securely — without ever exposing sensitive company information to
        third-party tools and websites.
      </p>


      <p>
        It supports a wide range of data and document types including{" "}
        <strong>JSON, XML, EDI (Edifact), Base64, plain text, and PDF</strong>, providing a
        powerful suite of operations designed for developers and analysts alike.
      </p>

      <div className="features mb-4">
        <h2 className="text-xl font-semibold mb-2">Key Features</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Compare & Validate:</strong> Compare JSON, XML, EDI, and text contents with
            highlighted differences.
          </li>
          <li>
            <strong>Beautify & Convert:</strong> Format, decode, encode, and convert between data
            formats effortlessly.
          </li>
          <li>
            <strong>Text Operations:</strong> Perform quick text transformations like
            uppercase/lowercase conversion, removing characters, merging lines, and more.
          </li>
          <li>
            <strong>PDF Tools:</strong> Merge, split, view, and convert PDF files — all securely
            within your internal environment.
          </li>
          <li>
            <strong>Security First:</strong> 100% internal processing — no external uploads or data
            leaks.
          </li>
        </ul>
      </div>

      <div className="built-for">
        <h2 className="text-xl font-semibold mb-2">Developed internally For</h2>
        <p>
          Everyone who seeks a privacy-first toolkit for data and
          document operations.
        </p>
      </div>

        <button className="close-modal-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default InfoModal;

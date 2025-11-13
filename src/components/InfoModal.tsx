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
          <strong>DataOps</strong> is your all-in-one open source platform for handling, transforming,
          and analyzing data securely — without ever exposing sensitive information to third-party tools or websites.
        </p>


        <p>
          It supports a wide range of data and document types including{" "}
          <strong>JSON, XML, EDI (Edifact), Base64, plain text, and PDF</strong>, providing a powerful suite
          of operations designed for developers and analysts alike.
        </p>

        <div className="features mb-4">
          <h2 className="text-xl font-semibold mb-2">Key Features</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Compare & Validate:</strong>  Compare JSON, XML, EDI, and text contents with
              highlighted differences and similarity scores.
            </li>
            <li>
              <strong>Beautify & Convert:</strong> Format, decode, encode, and convert between data
              formats effortlessly.
            </li>
            <li>
              <strong>Text Operations:</strong> Perform quick text transformations like case conversion,
              find & replace, line manipulation, and more.
            </li>
            <li>
              <strong>PDF Tools:</strong> Merge, split, extract pages, and manipulate
              PDF files — all securely in your browser.
            </li>
            <li>
              <strong>Privacy First:</strong> 100% client-side processing — no server uploads,
              no external APIs, no data leaves your device.
            </li>
            <li>
              <strong>Open Source:</strong> Free to use, modify, and contribute.
              Help us build better data tools for everyone.
            </li>
          </ul>
        </div>

        <div className="built-for">
          <h2 className="text-xl font-semibold mb-2">Developed By</h2>
          <p>
            <strong>Khaled Hweij</strong> (
            <a
              href="https://github.com/khaledhweij"
              target="_blank"
              rel="noopener noreferrer"
              className="modal-link"
            >
              @KhaledHweij
            </a>
            )
          </p>
          <p>
            Contributions welcome at:{' '}
            <a
              href="https://github.com/khaledhweij/DataOpsFront"
              target="_blank"
              rel="noopener noreferrer"
              className="modal-link"
            >
              github.com/khaledhweij/DataOpsFront
            </a>
          </p>

          <p className="modal-footer">
            Licensed under{' '}
            <a
              href="https://opensource.org/licenses/MIT"
              target="_blank"
              rel="noopener noreferrer"
              className="modal-link"
            >
              MIT License
            </a>
            {' '}| Version 1.0
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

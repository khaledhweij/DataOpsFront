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
        <h2>EdiDataBox</h2>
        <p>
          Your all-in-one internal tool for working with JSON, XML, EDI, Base64
          and PDF documents securely — without exposing sensitive company data.
        </p>

        <p className="modal-small-text">
          ✅ Compare documents<br />
          ✅ Beautify and convert text formats<br />
          ✅ Secure PDF operations<br />
          ✅ Developed 100% internally
        </p>

        <button className="close-modal-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default InfoModal;

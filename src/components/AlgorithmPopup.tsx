import React from "react";
import './AlgorithmPopup.css';

interface Props {
    onSelect: (algo: string) => void;
    onClose: () => void;
}

const algorithms = [
    "MD5",
    "SHA1",
    "SHA256",
    "SHA384",
    "SHA512",
    "SHA3",
    "RIPEMD",
];

export const AlgorithmPopup: React.FC<Props> = ({ onSelect, onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <h2>Select Encryption Type</h2>

                <div className="algo-grid">
                    {algorithms.map((algo) => (
                        <div key={algo} className="algo-card" onClick={() => onSelect(algo)}>
                            {algo}
                        </div>
                    ))}
                </div>
                <button className="close-modal-btn" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

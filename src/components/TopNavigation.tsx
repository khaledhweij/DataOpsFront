import { useNavigate, useLocation } from "react-router-dom";
import "./TopNavigation.css";
import { useState } from "react";
import InfoModal from "./InfoModal";
import { FaInfoCircle } from "react-icons/fa";

interface TopNavigationProps {
    darkMode: boolean;
    setDarkMode: (value: boolean) => void;
}

export default function TopNavigation({ darkMode, setDarkMode }: TopNavigationProps) {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [showInfoModal, setShowInfoModal] = useState(false);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    return (
        <div className="tabs-wrapper">
            <button
                className={`tab-btn ${pathname === "/" ? "active" : ""}`}
                onClick={() => navigate("/")}
            >
                Main Page
            </button>
            <button
                className={`tab-btn ${pathname === "/TextPage" ? "active" : ""}`}
                onClick={() => navigate("/TextPage")}
            >
                Text Tools
            </button>
            <button
                className={`tab-btn ${pathname === "/DocumentsPage" ? "active" : ""}`}
                onClick={() => navigate("/DocumentsPage")}
            >
               PDF Tools
            </button>
            <div className="header-icons">
                <button className="about-mode-button" onClick={toggleDarkMode}>
                    {darkMode ? "☀️" : "🌙"}
                </button>

                <button className="about-mode-button" onClick={() => setShowInfoModal(true)}>
                    About{/*= <FaInfoCircle style={{ marginTop: "5px" }}/> */}
                </button>
            </div>

            {showInfoModal && <InfoModal onClose={() => setShowInfoModal(false)} />}
        </div>
    );
}
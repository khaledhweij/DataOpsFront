import React, { useState } from "react";
import "./InfoModal.css";
import { infoModalText, Language } from "./infoModal.translations";

interface InfoModalProps {
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {

  const [lang, setLang] = useState<Language>("en");
  const t = infoModalText[lang];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="language-switch">
          <button
            className={lang === "en" ? "active" : ""}
            onClick={() => setLang("en")}
          >
            EN
          </button>
          <button
            className={lang === "es" ? "active" : ""}
            onClick={() => setLang("es")}
          >
            ES
          </button>
          <button
            className={lang === "ar" ? "active" : ""}
            onClick={() => setLang("ar")}
          >
            AR
          </button>
        </div>


        <div
          dir={lang === "ar" ? "rtl" : "ltr"}
        >

          <h2>{t.title}</h2>

          <p>{t.intro1}</p>
          <p>{t.intro2}</p>
          <p>{t.intro3}</p>
          <p>{t.intro4}</p>

          <div className="features mb-4">
            <h2 className="text-xl font-semibold mb-2">{t.featuresTitle}</h2>
            <ul className="list-disc list-inside space-y-1">
              {t.features.map((f: string, i: number) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          <div className="built-for">
            <h2 className="text-xl font-semibold mb-2">{t.developedBy}</h2>
            <p>
              <a
                href="https://www.linkedin.com/in/khaledhweij/"
                target="_blank"
                rel="noopener noreferrer"
                className="modal-link"
              >
                @KhaledHweij
              </a>
            </p>
            <p>
              {t.contributions}{' '}
              <a
                href="https://github.com/khaledhweij/DataOpsFront"
                target="_blank"
                rel="noopener noreferrer"
                className="modal-link"
              >
                github.com/khaledhweij/DataOpsFront
              </a>
            </p>
            <p>
              {t.feedback}{' '}
              <a
                href="mailto:khaledhweij@gmail.com?subject=DataOps%20Feedback"
                target="_blank"
                rel="noopener noreferrer"
                className="modal-link"
              >
                {t.sendFeedback}
              </a>
            </p>
            <p className="modal-footer">
              {t.licenced}{' '}
              <a
                href="https://opensource.org/licenses/MIT"
                target="_blank"
                rel="noopener noreferrer"
                className="modal-link"
              >
                MIT License
              </a>
              {' '}| {t.version} 1.0
            </p>
          </div>
        </div>
        <button className="close-modal-btn" onClick={onClose}>
          {t.close}
        </button>
      </div>
    </div>
  );
};

export default InfoModal;

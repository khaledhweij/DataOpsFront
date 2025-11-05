// components/Header.tsx
import { useState, useEffect } from 'react';
import './Header.css';
import lightLogo from "../assets/edicom-logo.png"
import darkLogo from "../assets/edicom-logo-dark.png"

type TabType = 'main' | 'text' | 'pdf';

interface HeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  showAbout: boolean;
  onToggleAbout: () => void;
}

export default function Header({ activeTab, onTabChange, showAbout, onToggleAbout }: HeaderProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [logo, setLogo] = useState<typeof lightLogo | typeof darkLogo>(lightLogo);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const savedLogo = localStorage.getItem('logo') === darkLogo ? darkLogo : lightLogo;
    setLogo(savedLogo);
    document.documentElement.setAttribute('logo-theme', savedLogo);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    const newLogo = theme === 'light' ? darkLogo : lightLogo;
    setLogo(newLogo)
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.setAttribute('logo-theme', newLogo);
    localStorage.setItem('theme', newTheme);
    localStorage.setItem('logo', newLogo);
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'main', label: 'Main Page' },
    { id: 'text', label: 'Text Tools' },
    { id: 'pdf', label: 'PDF Tools' },
  ];

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-top">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo" />
          </div>
          <div className="logo-section">
            <div>
              <span className="header-text">DataOps</span>
            </div>
          </div>

          <div className="header-controls">
            <button
              className="icon-button"
              onClick={onToggleAbout}
              title="About"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            <button
              className="icon-button"
              onClick={toggleTheme}
              title="Toggle theme"
            >
              {theme === 'light' ? (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <nav className="tab-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
import { useState } from 'react';
import Header from './components/Header';
import MainPage from './pages/MainPage';
import TextTools from './pages/TextPage';
import PdfTools from './pages/PdfPage';
import './App.css';
import InfoModal from './components/InfoModal';

type TabType = 'main' | 'text' | 'pdf';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('main');
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="app">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showAbout={showAbout}
        onToggleAbout={() => setShowAbout(!showAbout)}
      />

      <main className="main-content">
        {showAbout && <InfoModal onClose={() => setShowAbout(false)} />}

        {activeTab === 'main' && <MainPage />}
        {activeTab === 'text' && <TextTools />}
        {activeTab === 'pdf' && <PdfTools />}
      </main>
    </div>
  );
}
import { useState } from 'react';
import Header from './components/Header';
import MainPage from './pages/MainPage';
import TextTools from './pages/TextPage';
import PdfTools from './pages/PdfPage';
import ApiTester from './pages/ApiTester';
import TaskBoard from './pages/TaskBoard';
import TransferPage from './pages/TransferPage';
import './App.css';
import InfoModal from './components/InfoModal';

type TabType = 'main' | 'text' | 'pdf' | 'api' | 'tasks' | 'transfer';

// A scanned transfer QR code opens the site with ?transfer=CODE.
function readTransferCode(): string | undefined {
  const code = new URLSearchParams(window.location.search).get('transfer');
  if (!code) return undefined;
  window.history.replaceState(null, '', window.location.pathname);
  return code;
}

const initialTransferCode = readTransferCode();

export default function App() {
  const [transferCode, setTransferCode] = useState(initialTransferCode);
  const [activeTab, setActiveTab] = useState<TabType>(transferCode ? 'transfer' : 'main');
  const [showAbout, setShowAbout] = useState(false);

  return (
    <div className="app">
      <Header
        activeTab={activeTab}
        onTabChange={tab => {
          setActiveTab(tab);
          setTransferCode(undefined);
        }}
        showAbout={showAbout}
        onToggleAbout={() => setShowAbout(!showAbout)}
      />

      <main className="main-content">
        {showAbout && <InfoModal onClose={() => setShowAbout(false)} />}

        {activeTab === 'main' && <MainPage />}
        {activeTab === 'text' && <TextTools />}
        {activeTab === 'pdf' && <PdfTools />}
        {activeTab === 'api' && <ApiTester />}
        {activeTab === 'tasks' && <TaskBoard />}
        {activeTab === 'transfer' && <TransferPage initialCode={transferCode} />}
      </main>
    </div>
  );
}
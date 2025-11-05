// import React from "react";
// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import MainPage from "./pages/MainPage";
// import DocumentsPage from "./pages/DocumentsPage";
// import TextPage from "./pages/TextPage";
// import './App.css';

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<MainPage />} />
//         <Route path="/DocumentsPage" element={<DocumentsPage />} />
//         <Route path="/TextPage" element={<TextPage />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;


// App.tsx
import { useState } from 'react';
import Header from './application/Header';
import MainPage from './application/MainPage';
import TextTools from './application/TextPage';
import PdfTools from './application/PdfPage';
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
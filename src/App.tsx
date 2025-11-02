import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainPage from "./pages/MainPage";
import DocumentsPage from "./pages/DocumentsPage";
import TextPage from "./pages/TextPage";
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/DocumentsPage" element={<DocumentsPage />} />
        <Route path="/TextPage" element={<TextPage />} />
      </Routes>
    </Router>
  );
}

export default App;

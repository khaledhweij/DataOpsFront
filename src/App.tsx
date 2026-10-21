import { ReactNode, Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import InfoModal from './components/InfoModal';
import { appRoutes, HOME_PATH, transferJoinPath } from './routes';
import './App.css';

function PageTitle({ title, children }: { title: string; children: ReactNode }) {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return <>{children}</>;
}

export default function App() {
  const [showAbout, setShowAbout] = useState(false);
  const location = useLocation();

  // QR codes generated before path routing point at /?transfer=CODE.
  const legacyTransferCode = location.pathname === HOME_PATH && new URLSearchParams(location.search).get('transfer');
  if (legacyTransferCode) return <Navigate to={transferJoinPath(legacyTransferCode)} replace />;

  return (
    <div className="app">
      <Header
        showAbout={showAbout}
        onToggleAbout={() => setShowAbout(!showAbout)}
      />

      <main className="main-content">
        {showAbout && <InfoModal onClose={() => setShowAbout(false)} />}

        <Suspense fallback={null}>
          <Routes>
            {appRoutes.map(({ path, title, Component }) => (
              <Route
                key={path}
                path={path}
                element={<PageTitle title={title}><Component /></PageTitle>}
              />
            ))}
            <Route path="*" element={<Navigate to={HOME_PATH} replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

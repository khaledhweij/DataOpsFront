import { ComponentType, lazy } from 'react';
import MainPage from './pages/MainPage';

export interface AppRoute {
  path: string;
  /** Label shown in the header navigation. */
  label: string;
  /** Browser tab title. */
  title: string;
  Component: ComponentType;
}

export const HOME_PATH = '/';
export const TRANSFER_PATH = '/transfer';
export const TRANSFER_CODE_PARAM = 'code';

/** Link that opens the transfer page and joins the session with this code (used by the QR code). */
export const transferJoinPath = (code: string) =>
  `${TRANSFER_PATH}?${new URLSearchParams({ [TRANSFER_CODE_PARAM]: code })}`;

// The landing page is bundled eagerly; tool pages are code-split so their heavy
// dependencies (pdfjs, pdf-lib, peerjs...) only load when the page is opened.
export const appRoutes: AppRoute[] = [
  { path: HOME_PATH, label: 'Main Page', title: 'DataOps', Component: MainPage },
  { path: '/text', label: 'Text Tools', title: 'Text Tools | DataOps', Component: lazy(() => import('./pages/TextPage')) },
  { path: '/pdf', label: 'PDF Tools', title: 'PDF Tools | DataOps', Component: lazy(() => import('./pages/PdfPage')) },
  { path: '/api', label: 'API Tools', title: 'API Tools | DataOps', Component: lazy(() => import('./pages/ApiTester')) },
  { path: '/tasks', label: 'Tasks Board', title: 'Tasks Board | DataOps', Component: lazy(() => import('./pages/TaskBoard')) },
  { path: TRANSFER_PATH, label: 'Transfer', title: 'Transfer | DataOps', Component: lazy(() => import('./pages/TransferPage')) },
];

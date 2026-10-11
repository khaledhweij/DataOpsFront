// pages/TransferPage.tsx
import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './PdfTools.css';
import './TransferPage.css';
import { TransferSession, normalizeCode, isValidCode, TransferCallbacks, TransferKind } from '../services/transferService';

type Stage = 'choose' | 'hosting' | 'joining' | 'connected' | 'disconnected' | 'error';

interface TransferItem {
  id: string;
  kind: TransferKind;
  name: string;
  size: number;
  mime: string;
  done: number;
  url?: string;
  file?: File;
  text?: string;
  failed?: string;
}

const LARGE_FILE_BYTES = 500 * 1024 * 1024;
const PREVIEW_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/bmp'];

const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;

// Phones get the system share sheet ("Save to Files", "Save Image"...) instead of a download link,
// because mobile browsers open PDFs in the same tab, which unloads this page and drops the connection.
// The share sheet needs HTTPS, so it is not available on a plain http:// dev server.
function canShareFile(file: File): boolean {
  return isTouchDevice() && !!navigator.canShare?.({ files: [file] });
}

function downloadItem(item: TransferItem) {
  if (!item.url) return;
  // On phones, open the file in a new tab so this page (and the connection) stays alive.
  if (isTouchDevice() && window.open(item.url, '_blank')) return;
  const link = document.createElement('a');
  link.href = item.url;
  link.download = item.name;
  link.click();
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // navigator.clipboard only exists on HTTPS pages; fall back to the legacy copy command.
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  }
}

const isLink = (text: string) => /^https?:\/\/\S+$/i.test(text.trim());

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface TransferPageProps {
  initialCode?: string;
}

export default function TransferPage({ initialCode }: TransferPageProps) {
  const [stage, setStage] = useState<Stage>('choose');
  const [code, setCode] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [status, setStatus] = useState('');
  const [request, setRequest] = useState('');
  const [peerDevice, setPeerDevice] = useState('');
  const [sent, setSent] = useState<TransferItem[]>([]);
  const [received, setReceived] = useState<TransferItem[]>([]);
  const [textInput, setTextInput] = useState('');
  const [copiedId, setCopiedId] = useState('');
  const sessionRef = useRef<TransferSession | null>(null);
  const urlsRef = useRef<string[]>([]);

  const updateItem = (setter: typeof setSent, id: string, changes: Partial<TransferItem>) => {
    setter(prev => prev.map(item => (item.id === id ? { ...item, ...changes } : item)));
  };

  const startSession = () => {
    sessionRef.current?.destroy();
    const callbacks: TransferCallbacks = {
      onCode: newCode => {
        setCode(newCode);
        setStatus('Waiting for the other device...');
      },
      onRequest: device => setRequest(device),
      onRequestCancelled: () => setRequest(''),
      onWaitingForAccept: () => setStatus('Waiting for the other device to accept...'),
      onConnected: device => {
        setRequest('');
        setPeerDevice(device);
        setStage('connected');
      },
      onReceiveStart: file => setReceived(prev => [{ ...file, done: 0 }, ...prev]),
      onReceiveProgress: (id, bytes) => updateItem(setReceived, id, { done: bytes }),
      onReceiveDone: (meta, blob) => {
        if (meta.kind === 'text') {
          blob.text().then(text => updateItem(setReceived, meta.id, { done: blob.size, text }));
          return;
        }
        const url = URL.createObjectURL(blob);
        urlsRef.current.push(url);
        updateItem(setReceived, meta.id, { done: blob.size, url, file: new File([blob], meta.name, { type: blob.type }) });
      },
      onDisconnected: () => setStage('disconnected'),
      onError: message => {
        setStatus(message);
        setStage('error');
      },
    };
    const session = new TransferSession(callbacks);
    sessionRef.current = session;
    return session;
  };

  const handleSend = () => {
    setCode('');
    setStatus('Creating a code...');
    setStage('hosting');
    startSession().host();
  };

  const handleJoin = (rawCode: string) => {
    const normalized = normalizeCode(rawCode);
    if (!isValidCode(normalized)) {
      setStatus('Please enter the 6-character code shown on the other device.');
      return;
    }
    setCodeInput(normalized);
    setStatus('Connecting...');
    setStage('joining');
    startSession().join(normalized);
  };

  const handleReset = () => {
    sessionRef.current?.destroy();
    sessionRef.current = null;
    setStage('choose');
    setCode('');
    setStatus('');
    setRequest('');
  };

  const handleFiles = (files: File[]) => {
    const session = sessionRef.current;
    if (!session || files.length === 0) return;

    for (const file of files) {
      const id = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`;
      setSent(prev => [{ id, kind: 'file', name: file.name, size: file.size, mime: file.type, done: 0 }, ...prev]);
      session.sendFile(
        file,
        bytes => updateItem(setSent, id, { done: bytes }),
        () => updateItem(setSent, id, { done: file.size }),
        message => updateItem(setSent, id, { failed: message }),
      );
    }
  };

  const handleSendText = () => {
    const session = sessionRef.current;
    const text = textInput;
    if (!session || !text.trim()) return;

    const id = `text-${Date.now()}-${Math.random()}`;
    const size = new Blob([text]).size;
    setSent(prev => [{ id, kind: 'text', name: 'Text', size, mime: 'text/plain', done: 0, text }, ...prev]);
    setTextInput('');
    session.sendText(
      text,
      () => updateItem(setSent, id, { done: size }),
      message => updateItem(setSent, id, { failed: message }),
    );
  };

  const handleCopy = async (item: TransferItem) => {
    if (item.text !== undefined && (await copyText(item.text))) {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(current => (current === item.id ? '' : current)), 2000);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSave = (item: TransferItem) => {
    if (item.file && canShareFile(item.file)) {
      navigator.share({ files: [item.file] }).catch(err => {
        if (err?.name !== 'AbortError') downloadItem(item);
      });
    } else {
      downloadItem(item);
    }
  };

  // If the page is left anyway (e.g. a browser opens a file in this tab), close the session cleanly
  // and, when the user comes back, say so instead of showing a connection that no longer exists.
  useEffect(() => {
    let leftWhileActive = false;
    const onPageHide = () => {
      if (!sessionRef.current) return;
      leftWhileActive = true;
      sessionRef.current.destroy();
      sessionRef.current = null;
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted || !leftWhileActive) return;
      leftWhileActive = false;
      setRequest('');
      setStatus('The connection was closed because this page was left. Start over to reconnect.');
      setStage('error');
    };
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);

  // Leaving or reloading the page drops the connection and the received files.
  useEffect(() => {
    if (stage !== 'connected') return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [stage]);

  // Opened from a scanned QR code: connect straight away.
  useEffect(() => {
    if (initialCode) handleJoin(initialCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      sessionRef.current?.destroy();
      sessionRef.current = null;
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const shareLink = `${window.location.origin}${window.location.pathname}?transfer=${code}`;
  const hasLargeFile = sent.some(item => item.size > LARGE_FILE_BYTES);

  const renderItem = (item: TransferItem, direction: 'sent' | 'received') => {
    const percent = item.size === 0 ? 100 : Math.round((item.done / item.size) * 100);
    const complete = direction === 'sent'
      ? item.done >= item.size && !item.failed
      : item.kind === 'text' ? item.text !== undefined : !!item.url;
    return (
      <div key={item.id} className="transfer-item">
        {item.url && PREVIEW_TYPES.includes(item.mime) && (
          <img className="transfer-preview" src={item.url} alt={item.name} />
        )}
        <div className="transfer-item-body">
          {item.kind === 'text' ? (
            item.text !== undefined && <div className="transfer-text">{item.text}</div>
          ) : (
            <div className="transfer-item-row">
              <span className="file-item-name">{item.name}</span>
              <span className="file-item-size">{formatSize(item.size)}</span>
            </div>
          )}
          {item.kind === 'file' && (
            <div className="transfer-progress">
              <div className={`transfer-progress-bar ${item.failed ? 'failed' : ''}`} style={{ width: `${percent}%` }} />
            </div>
          )}
          <div className="transfer-item-row">
            <span className="transfer-item-status">
              {item.failed ? `✗ ${item.failed}` : complete ? (direction === 'sent' ? '✓ Sent' : '✓ Received') : `${percent}%`}
            </span>
            {item.url && (
              <button className="btn btn-primary btn-small" onClick={() => handleSave(item)}>
                {item.file && canShareFile(item.file) ? 'Save' : 'Download'}
              </button>
            )}
            {item.kind === 'text' && item.text !== undefined && (
              <div className="transfer-item-actions">
                {isLink(item.text) && (
                  <a className="btn btn-outline btn-small" href={item.text.trim()} target="_blank" rel="noopener noreferrer">
                    Open link
                  </a>
                )}
                <button className="btn btn-primary btn-small" onClick={() => handleCopy(item)}>
                  {copiedId === item.id ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="transfer-page">
      <div className="alert-info">
        <div>
          <div className="alert-title">Private device-to-device transfer</div>
          <div className="alert-text">
            Open this page on both devices. Files and text go directly between them over an encrypted connection and are never
            uploaded to a server. Works best when both devices are on the same Wi-Fi.
          </div>
        </div>
      </div>

      {stage === 'choose' && (
        <div className="transfer-choose">
          <div className="card">
            <h2 className="card-title">Send</h2>
            <p className="transfer-hint">Show a code on this device, then enter or scan it on the other one.</p>
            <button className="btn btn-primary btn-large" onClick={handleSend}>Get a code</button>
          </div>
          <div className="card">
            <h2 className="card-title">Receive</h2>
            <p className="transfer-hint">Enter the code shown on the other device.</p>
            <form
              className="transfer-code-form"
              onSubmit={e => {
                e.preventDefault();
                handleJoin(codeInput);
              }}
            >
              <input
                className="input-number transfer-code-input"
                value={codeInput}
                maxLength={8}
                placeholder="ABC123"
                autoCapitalize="characters"
                autoComplete="off"
                onChange={e => setCodeInput(e.target.value.toUpperCase())}
              />
              <button type="submit" className="btn btn-primary btn-large">Connect</button>
            </form>
            {status && <p className="transfer-status">{status}</p>}
          </div>
        </div>
      )}

      {stage === 'hosting' && (
        <div className="card transfer-center">
          {code ? (
            <>
              <p className="transfer-hint">Enter this code on the other device, or scan the QR code with its camera.</p>
              <div className="transfer-code">{code}</div>
              <div className="transfer-qr">
                <QRCodeSVG value={shareLink} size={192} marginSize={2} />
              </div>
            </>
          ) : null}

          {request ? (
            <div className="transfer-request">
              <p><strong>{request}</strong> wants to connect.</p>
              <div className="result-buttons">
                <button className="btn btn-primary" onClick={() => sessionRef.current?.accept()}>Accept</button>
                <button className="btn btn-outline" onClick={() => sessionRef.current?.reject()}>Reject</button>
              </div>
            </div>
          ) : (
            <p className="transfer-status">{status}</p>
          )}
          <button className="btn btn-secondary" onClick={handleReset}>Cancel</button>
        </div>
      )}

      {stage === 'joining' && (
        <div className="card transfer-center">
          <div className="transfer-code">{codeInput}</div>
          <p className="transfer-status">{status}</p>
          <button className="btn btn-secondary" onClick={handleReset}>Cancel</button>
        </div>
      )}

      {(stage === 'error' || stage === 'disconnected') && (
        <div className="card transfer-center">
          <p className="transfer-status">
            {stage === 'error' ? `✗ ${status}` : 'The other device disconnected.'}
          </p>
          <button className="btn btn-primary" onClick={handleReset}>Start over</button>
        </div>
      )}

      {stage === 'connected' && (
        <div className="card mb-3">
          <div className="card-header">
            <h2 className="card-title">Connected to {peerDevice}</h2>
            <button className="btn btn-secondary" onClick={handleReset}>Disconnect</button>
          </div>
          <div
            className="file-upload-area transfer-drop"
            onClick={() => document.getElementById('transfer-file-input')?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <svg className="file-upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="file-upload-text">Tap to choose files to send</p>
            <p className="file-upload-hint">Or drag & drop images, PDFs or any other files</p>
            <input id="transfer-file-input" type="file" multiple style={{ display: 'none' }} onChange={handleFileSelect} />
          </div>
          <div className="transfer-text-form">
            <textarea
              className="textarea transfer-textarea"
              value={textInput}
              placeholder="Or type / paste text or a link to send"
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSendText();
              }}
            />
            <button className="btn btn-primary" onClick={handleSendText} disabled={!textInput.trim()}>
              Send text
            </button>
          </div>
          {hasLargeFile && (
            <p className="transfer-status">
              Large files are held in memory on the receiving device and may fail on phones.
            </p>
          )}
        </div>
      )}

      {(sent.length > 0 || received.length > 0) && (
        <div className="transfer-lists">
          <div className="card">
            <h3 className="card-subtitle">Received</h3>
            {received.length === 0 ? <p className="transfer-hint">Nothing received yet.</p> : received.map(item => renderItem(item, 'received'))}
          </div>
          <div className="card">
            <h3 className="card-subtitle">Sent</h3>
            {sent.length === 0 ? <p className="transfer-hint">Nothing sent yet.</p> : sent.map(item => renderItem(item, 'sent'))}
          </div>
        </div>
      )}

      <div className="footer-container">Open Source - Licensed under MIT License - Version 1.0</div>
    </div>
  );
}

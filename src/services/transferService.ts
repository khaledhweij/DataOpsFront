import Peer, { DataConnection, PeerError } from 'peerjs';

// Peer-to-peer file transfer over WebRTC. The free PeerJS cloud server is only
// used so the two browsers can find each other; file bytes go directly between
// the devices over an encrypted (DTLS) data channel.

const ID_PREFIX = 'dataopsapp-';
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
const CODE_LENGTH = 6;
const CHUNK_SIZE = 64 * 1024;
const MAX_BUFFERED = 1024 * 1024;
const LOW_BUFFERED = 256 * 1024;
const CONNECT_TIMEOUT_MS = 15000;

export type TransferKind = 'file' | 'text';

export interface FileMeta {
  id: string;
  kind: TransferKind;
  name: string;
  size: number;
  mime: string;
}

type ControlMessage =
  | { t: 'accept'; device: string }
  | { t: 'meta'; file: FileMeta }
  | { t: 'end'; id: string };

export interface TransferCallbacks {
  onCode?: (code: string) => void;
  onRequest?: (device: string) => void;
  onRequestCancelled?: () => void;
  onWaitingForAccept?: () => void;
  onConnected?: (device: string) => void;
  onReceiveStart?: (file: FileMeta) => void;
  onReceiveProgress?: (id: string, received: number) => void;
  onReceiveDone?: (file: FileMeta, blob: Blob) => void;
  onDisconnected?: () => void;
  onError?: (message: string) => void;
}

export function generateCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  return Array.from(bytes, b => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
}

export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isValidCode(code: string): boolean {
  return code.length === CODE_LENGTH && code.split('').every(c => CODE_ALPHABET.includes(c));
}

export function describeDevice(): string {
  const ua = navigator.userAgent;
  const os = /iPhone/.test(ua) ? 'iPhone'
    : /iPad/.test(ua) ? 'iPad'
    : /Android/.test(ua) ? 'Android'
    : /Windows/.test(ua) ? 'Windows'
    : /Mac OS X/.test(ua) ? 'Mac'
    : /Linux/.test(ua) ? 'Linux'
    : 'Unknown device';
  const browser = /Edg\//.test(ua) ? 'Edge'
    : /Firefox\/|FxiOS/.test(ua) ? 'Firefox'
    : /Chrome\/|CriOS/.test(ua) ? 'Chrome'
    : /Safari\//.test(ua) ? 'Safari'
    : 'Browser';
  return `${os} · ${browser}`;
}

function sendControl(conn: DataConnection, msg: ControlMessage) {
  conn.send(JSON.stringify(msg));
}

function peerErrorMessage(err: PeerError<string>): string {
  switch (err.type) {
    case 'peer-unavailable':
      return 'Code not found. Check the code and make sure the sending page is still open.';
    case 'browser-incompatible':
      return 'This browser does not support peer-to-peer transfers.';
    case 'webrtc':
      return 'Direct connection failed. Try again with both devices on the same Wi-Fi.';
    case 'network':
    case 'server-error':
    case 'socket-error':
    case 'socket-closed':
      return 'Could not reach the connection server. Check your internet connection.';
    default:
      return `Connection error: ${err.message}`;
  }
}

export class TransferSession {
  private peer: Peer | null = null;
  private conn: DataConnection | null = null;
  private pending: DataConnection | null = null;
  private connected = false;
  private destroyed = false;
  private timeout: ReturnType<typeof setTimeout> | null = null;
  private sendQueue: Promise<void> = Promise.resolve();
  private incoming: { meta: FileMeta; chunks: ArrayBuffer[]; received: number } | null = null;
  private fileCounter = 0;

  constructor(private callbacks: TransferCallbacks) {}

  // Sender side: register a code on the signaling server and wait for a device.
  host(attempt = 0) {
    const code = generateCode();
    const peer = new Peer(ID_PREFIX + code);
    this.peer = peer;

    peer.on('open', () => this.cb.onCode?.(code));
    peer.on('connection', conn => this.handleIncoming(conn));
    peer.on('error', err => {
      if (err.type === 'unavailable-id' && attempt < 3) {
        peer.destroy();
        this.host(attempt + 1);
        return;
      }
      if (!this.connected) this.fail(peerErrorMessage(err));
    });
  }

  // Receiver side: connect to the device showing the code.
  join(code: string) {
    const peer = new Peer();
    this.peer = peer;

    peer.on('open', () => {
      const conn = peer.connect(ID_PREFIX + code, {
        reliable: true,
        serialization: 'raw',
        metadata: { device: describeDevice() },
      });
      this.conn = conn;
      conn.on('open', () => {
        this.clearTimeout();
        this.setupChannel(conn);
        this.cb.onWaitingForAccept?.();
      });
      conn.on('close', () => this.handleClose());
      conn.on('error', () => this.handleClose());
    });
    peer.on('error', err => {
      if (!this.connected) this.fail(peerErrorMessage(err));
    });

    this.timeout = setTimeout(() => {
      this.fail('Could not connect to the other device. Try again with both devices on the same Wi-Fi.');
    }, CONNECT_TIMEOUT_MS);
  }

  accept() {
    const conn = this.pending;
    if (!conn) return;
    this.pending = null;
    this.conn = conn;
    this.connected = true;
    this.setupChannel(conn);
    sendControl(conn, { t: 'accept', device: describeDevice() });
    // Leave the signaling server so the code can no longer be used.
    this.peer?.disconnect();
    this.cb.onConnected?.(conn.metadata?.device ?? 'Unknown device');
  }

  reject() {
    this.pending?.close();
    this.pending = null;
  }

  sendFile(file: File, onProgress: (sent: number) => void, onDone: () => void, onError: (message: string) => void) {
    this.enqueue(file, 'file', onProgress, onDone, onError);
  }

  // Text goes through the same chunked pipeline as files, so long texts work and stay in order.
  sendText(text: string, onDone: () => void, onError: (message: string) => void) {
    const file = new File([text], 'text.txt', { type: 'text/plain;charset=utf-8' });
    this.enqueue(file, 'text', () => {}, onDone, onError);
  }

  private enqueue(file: File, kind: TransferKind, onProgress: (sent: number) => void, onDone: () => void, onError: (message: string) => void) {
    const id = `${Date.now()}-${++this.fileCounter}`;
    this.sendQueue = this.sendQueue
      .then(() => this.doSendFile(id, kind, file, onProgress))
      .then(onDone, err => onError(err instanceof Error ? err.message : String(err)));
  }

  destroy() {
    this.destroyed = true;
    this.clearTimeout();
    this.conn?.close();
    this.pending?.close();
    this.peer?.destroy();
  }

  private handleIncoming(conn: DataConnection) {
    // Only one device per code: refuse extra connections while one is pending or accepted.
    if (this.connected || (this.pending && this.pending.open)) {
      conn.on('open', () => conn.close());
      return;
    }
    this.pending = conn;
    conn.on('open', () => this.cb.onRequest?.(conn.metadata?.device ?? 'Unknown device'));
    conn.on('close', () => {
      if (this.pending === conn) {
        this.pending = null;
        this.cb.onRequestCancelled?.();
      } else if (this.conn === conn) {
        this.handleClose();
      }
    });
  }

  private setupChannel(conn: DataConnection) {
    conn.dataChannel.bufferedAmountLowThreshold = LOW_BUFFERED;
    conn.on('data', data => this.handleData(data));
  }

  private handleData(data: unknown) {
    if (data instanceof ArrayBuffer) {
      if (!this.connected || !this.incoming) return;
      this.incoming.chunks.push(data);
      this.incoming.received += data.byteLength;
      this.cb.onReceiveProgress?.(this.incoming.meta.id, this.incoming.received);
      return;
    }
    if (typeof data !== 'string') return;

    let msg: ControlMessage;
    try {
      msg = JSON.parse(data);
    } catch {
      return;
    }

    if (msg.t === 'accept' && !this.connected) {
      this.connected = true;
      this.cb.onConnected?.(msg.device);
    } else if (msg.t === 'meta' && this.connected) {
      const meta: FileMeta = { ...msg.file, kind: msg.file.kind === 'text' ? 'text' : 'file' };
      this.incoming = { meta, chunks: [], received: 0 };
      this.cb.onReceiveStart?.(meta);
    } else if (msg.t === 'end' && this.incoming && this.incoming.meta.id === msg.id) {
      const { meta, chunks } = this.incoming;
      this.incoming = null;
      this.cb.onReceiveDone?.(meta, new Blob(chunks, { type: meta.mime }));
    }
  }

  private async doSendFile(id: string, kind: TransferKind, file: File, onProgress: (sent: number) => void) {
    const conn = this.conn;
    if (!conn || !this.connected) throw new Error('Not connected');

    const meta: FileMeta = { id, kind, name: file.name, size: file.size, mime: file.type || 'application/octet-stream' };
    sendControl(conn, { t: 'meta', file: meta });

    const maxMessage = conn.peerConnection.sctp?.maxMessageSize || CHUNK_SIZE;
    const chunkSize = Math.min(CHUNK_SIZE, maxMessage);

    for (let offset = 0; offset < file.size; offset += chunkSize) {
      await this.waitForDrain(conn);
      const chunk = await file.slice(offset, offset + chunkSize).arrayBuffer();
      conn.send(chunk);
      onProgress(Math.min(offset + chunkSize, file.size));
    }
    sendControl(conn, { t: 'end', id });
  }

  private waitForDrain(conn: DataConnection): Promise<void> {
    const dc = conn.dataChannel;
    if (dc.readyState !== 'open') return Promise.reject(new Error('Connection closed'));
    if (dc.bufferedAmount <= MAX_BUFFERED) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        dc.removeEventListener('bufferedamountlow', onLow);
        dc.removeEventListener('close', onClose);
      };
      const onLow = () => { cleanup(); resolve(); };
      const onClose = () => { cleanup(); reject(new Error('Connection closed')); };
      dc.addEventListener('bufferedamountlow', onLow);
      dc.addEventListener('close', onClose);
    });
  }

  private handleClose() {
    if (this.destroyed) return;
    if (this.connected) {
      this.connected = false;
      this.cb.onDisconnected?.();
    } else {
      this.fail('The other device closed or rejected the connection.');
    }
  }

  private fail(message: string) {
    if (this.destroyed) return;
    this.cb.onError?.(message);
    this.destroy();
  }

  private clearTimeout() {
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = null;
  }

  // Callbacks go quiet once the session is destroyed, so a closed page never gets stale updates.
  private get cb(): TransferCallbacks {
    return this.destroyed ? {} : this.callbacks;
  }
}

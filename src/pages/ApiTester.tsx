import { useState } from 'react';
import './ApiTester.css'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export default function ApiTester() {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<Method>('GET');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [curlInput, setCurlInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  
  const getDefaultHeaders = () => {
    return JSON.stringify({
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Connection": "keep-alive",
      "User-Agent": "DataOps-API-Client/3.0"
    }, null, 2);
  };

  const [headers, setHeaders] = useState(getDefaultHeaders());

  function parseCurl(curl: string) {
    const tokens = curl.match(/"[^"]*"|'[^']*'|\S+/g) || [];

    const result: any = {
      method: "GET",
      url: "",
      headers: {},
      body: null
    };

    let i = 0;

    while (i < tokens.length) {
      let token = tokens[i];

      const strip = (v: string) => v.replace(/^['"]|['"]$/g, "");

      if (token === "curl") {
        i++;
        continue;
      }

      if (token.startsWith("http") || token.startsWith("'http") || token.startsWith("\"http")) {
        result.url = strip(token);
        i++;
        continue;
      }

      if (token === "-X" || token === "--request") {
        result.method = strip(tokens[i + 1]);
        i += 2;
        continue;
      }

      if (token === "-H" || token === "--header") {
        const headerRaw = strip(tokens[i + 1]);

        const splitIndex = headerRaw.indexOf(":");
        if (splitIndex !== -1) {
          const key = headerRaw.slice(0, splitIndex).trim();
          const value = headerRaw.slice(splitIndex + 1).trim();
          result.headers[key] = value;
        }

        i += 2;
        continue;
      }

      if (
        token === "-d" ||
        token === "--data" ||
        token === "--data-raw" ||
        token === "--data-binary" ||
        token === "--data-urlencode"
      ) {
        const bodyValue = strip(tokens[i + 1]);
        result.body = bodyValue;

        if (!result.method || result.method === "GET") {
          result.method = "POST";
        }

        i += 2;
        continue;
      }

      i++;
    }

    return result;
  }

  const handleUrlChange = (value: string) => {
    if (value.trim().startsWith('curl ')) {
      const result = parseCurl(value);
      if (result.url) setUrl(result.url);
      if (result.method) setMethod(result.method);
      if (result.headers) setHeaders(JSON.stringify(result.headers, null, 2));
      if (result.body) setBody(result.body);
      return;
    } else {
      setUrl(value);
    }
  };

  const handleSendRequest = async () => {
    if (!url) {
      setResponse('Please enter a URL or paste a CURL command');
      return;
    }

    setLoading(true);
    setResponse('');
    setStatusCode(null);

    try {
      const parsedHeaders = headers ? JSON.parse(headers) : {};

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...parsedHeaders,
        },
      };

      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        options.body = body;
      }

      const startTime = performance.now();
      const res = await fetch(url, options);
      const endTime = performance.now();

      setStatusCode(res.status);

      const contentType = res.headers.get('content-type');
      let data;

      if (contentType?.includes('application/json')) {
        data = await res.json();
        setResponse(JSON.stringify(data, null, 2));
      } else {
        data = await res.text();
        setResponse(data);
      }

      setResponse(prev => `⏱️ ${(endTime - startTime).toFixed(0)}ms\n\n${prev}`);
    } catch (error) {
      setResponse(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResultToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(response);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1000); // hide after 1s
    } catch (err) {
    }
  };

  const handleClear = () => {
    setUrl('');
    setMethod('GET');
    setHeaders(getDefaultHeaders());
    setBody('');
    setResponse('');
    setStatusCode(null);
    setCurlInput('');
  };

  return (
    <div className="api-tester">
      <div className="card mb-3">
        <h2 className="card-title">API Tester</h2>

        <div className="curl-import mb-2" style={{ marginTop: '1.5rem' }}>
          <textarea
            className="textarea"
            placeholder="Paste CURL command here:"
            value={curlInput}
            onChange={(e) => setCurlInput(e.target.value)}
            style={{ minHeight: '100px', marginBottom: '0.75rem' }}
          />
          <button
            className="btn btn-secondary"
            onClick={() => {
              const result = parseCurl(curlInput);

              if (result.url) setUrl(result.url);
              if (result.method) setMethod(result.method);
              if (result.headers) setHeaders(JSON.stringify(result.headers, null, 2));
              if (result.body) setBody(result.body);

              setCurlInput(curlInput);
            }}
            disabled={!curlInput}
          >
            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import from CURL
          </button>
        </div>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="api-request-line">
          <select
            className="method-select"
            value={method}
            onChange={(e) => setMethod(e.target.value as Method)}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>

          <input
            type="text"
            className="url-input"
            placeholder="https://api.example.com/endpoint (or paste CURL)"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            onPaste={(e) => {
              const pastedText = e.clipboardData.getData('text');
              if (pastedText.trim().startsWith('curl ')) {
                e.preventDefault();
                const result = parseCurl(pastedText);

                if (result.url) setUrl(result.url);
                if (result.method) setMethod(result.method);
                if (result.headers) setHeaders(JSON.stringify(result.headers, null, 2));
                if (result.body) setBody(result.body);

                setCurlInput(pastedText);
              }
            }}
          />

          <button
            className="btn btn-primary"
            onClick={handleSendRequest}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleClear}
            title="Clear all fields"
          >
            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <h3 className="card-subtitle" style={{ marginBottom: 0 }}>Headers (JSON)</h3>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setHeaders(getDefaultHeaders())}
            title="Reset to default headers"
          >
            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>
        <textarea
          className="textarea"
          placeholder='{"Authorization": "Bearer token"}'
          value={headers}
          onChange={(e) => setHeaders(e.target.value)}
          style={{ minHeight: '120px' }}
        />
      </div>

      {['POST', 'PUT', 'PATCH'].includes(method) && (
        <div className="card mb-3">
          <h3 className="card-subtitle">Request Body (JSON)</h3>
          <textarea
            className="textarea"
            placeholder='{"key": "value"}'
            value={body}
            onChange={(e) => setBody(e.target.value)}
            style={{ minHeight: '150px' }}
          />
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-subtitle" style={{ marginBottom: 0 }}>Response</h3>
          <div className="response-actions">
            {statusCode && (
              <span className={`status-badge status-${Math.floor(statusCode / 100)}`}>
                {statusCode}
              </span>
            )}
            {response && (
              <button
                className="btn btn-outline btn-sm"
                onClick={handleCopyResultToClipboard}
              >
                {isCopied ? "Copied!" : "Copy to clipboard"}
              </button>
            )}
          </div>
        </div>
        <pre className="response-area">
          {response || 'Response will appear here...'}
        </pre>
      </div>
    </div>
  );
}
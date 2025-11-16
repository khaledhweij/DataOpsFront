import { postActionRaw } from "../services/apiService";
import { encode, decode } from "@toon-format/toon";

export const backendApiHandler = async (
  action: string,
  content: string,
  isAlert: boolean = false
): Promise<string> => {
  try {
    if (!content.trim()) {
      alert("Content cannot be empty.");
      return "";
    }

    const response = await postActionRaw(action, content);

    if (response.ok) {
      const data = await response.text();

      if (isAlert) {
        alert(data);
      }

      return data;
    } else {
      const error = await response.text();
      alert(error);
      return error;
    }
  } catch (error) {
    const errMsg = `Fetch error: ${(error as Error).message}`;
    alert(errMsg);
    return errMsg;
  }
};

// ===== AUTO-DETECT BEAUTIFY =====
export const autoBeautify = (content: string): string => {
  const trimmed = content.trim();
  
  if (!trimmed) {
    throw new Error('Content is empty');
  }

    const stackTracePatterns = [
    /at\s+[\w$.]+\s*\([^)]*\)/m, 
    /^\s*at\s+/m,                  
    /\w+Exception:/m,               
    /Error:\s*\n\s+at\s+/m,        
    /^\s*\d+\s+[^\s]+\s+0x[0-9a-f]+/m, 
  ];
  
  if (isStackTrace(trimmed)) {
    return beautifyStackTrace(trimmed);
  }
  
  // Check for EDIFACT
  if (trimmed.includes("'") && (trimmed.startsWith('UNB') || trimmed.startsWith('UNA') || trimmed.includes('UNH'))) {
    return beautifyEdifact(trimmed);
  }
  
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // Not valid JSON, continue to XML check
    }
  }
  
  if (trimmed.startsWith('<')) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(trimmed, 'application/xml');
      
      if (!doc.querySelector('parsererror')) {
        return beautifyXml(trimmed);
      }
    } catch {
      // Not valid XML, treat as plain text
    }
  }
  
  return trimmed;
};

const isStackTrace = (input: string): boolean => {
  return (
    input.includes("Exception:") ||
    input.includes("Error:") ||
    /\s+at\s+\S+\([\s\S]*\.\w+:\d+\)/.test(input)
  );
};

const beautifyStackTrace = (content: string): string => {
  return content
    .replace(/ at /g, "\n\tat ")
    .replace(/Caused by:/g, "\nCaused by:")
    .trim();
};

// ===== AUTO-DETECT VALIDATION =====
export const autoValidate = (content: string): { isValid: boolean; type: string; message: string } => {
  const trimmed = content.trim();
  
  if (!trimmed) {
    return { isValid: false, type: 'empty', message: 'Content is empty' };
  }
  
  // Check for EDIFACT
  if (trimmed.includes("'") && (trimmed.startsWith('UNB') || trimmed.startsWith('UNA') || trimmed.includes('UNH'))) {
    const isValid = validateEdifact(trimmed);
    return { 
      isValid, 
      type: 'EDIFACT', 
      message: isValid ? 'Valid EDIFACT' : 'Invalid EDIFACT format' 
    };
  }
  
  // Try JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed);
      return { isValid: true, type: 'JSON', message: 'Valid JSON' };
    } catch (error) {
      return { isValid: false, type: 'JSON', message: `Invalid JSON: ${(error as Error).message}` };
    }
  }
  
  // Try XML
  if (trimmed.startsWith('<')) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(trimmed, 'application/xml');
      
      if (doc.querySelector('parsererror')) {
        return { isValid: false, type: 'XML', message: 'Invalid XML format' };
      }
      return { isValid: true, type: 'XML', message: 'Valid XML' };
    } catch (error) {
      return { isValid: false, type: 'XML', message: `Invalid XML: ${(error as Error).message}` };
    }
  }
  
  return { isValid: true, type: 'Text', message: 'Plain text content' };
};

// ===== EDIFACT =====
const beautifyEdifact = (edifact: string): string => {
  return edifact.replace(/'/g, "'\n");
};

const validateEdifact = (edifact: string): boolean => {
  // Basic EDIFACT validation
  // Should contain segment terminators (')
  // Should start with UNA or UNB
  const hasTerminators = edifact.includes("'");
  const hasValidStart = edifact.startsWith('UNA') || edifact.startsWith('UNB');
  const hasSegments = edifact.includes('UNH') || edifact.includes('UNT');
  
  return hasTerminators && hasValidStart && hasSegments;
};

// ===== JSON =====
export const beautifyJson = (jsonString: string): string => {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch (error) {
    throw new Error('Invalid JSON');
  }
};

export const validateJson = (jsonString: string): boolean => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
};

// ===== XML =====
const beautifyXml = (xmlString: string): string => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'application/xml');
    const serializer = new XMLSerializer();
    const xmlStr = serializer.serializeToString(doc);
    
    return formatXml(xmlStr);
  } catch (error) {
    throw new Error('Failed to beautify XML');
  }
};

const formatXml = (xml: string): string => {
  let formatted = '';
  let indent = 0;
  
  xml.split(/>\s*</).forEach((node) => {
    if (node.match(/^\/\w/)) {
      indent = Math.max(0, indent - 1);
    }
    formatted += '  '.repeat(indent) + '<' + node + '>\n';
    if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('?')) {
      indent++;
    }
  });
  
  return formatted.substring(1, formatted.length - 2);
};

export const validateXml = (xmlString: string): boolean => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'application/xml');
    return !doc.querySelector('parsererror');
  } catch {
    return false;
  }
};

// ===== OTHER UTILITIES =====
export const decodeJwt = (token: string): string => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    
    return JSON.stringify({ header, payload }, null, 2);
  } catch (error) {
    throw new Error('Invalid JWT token');
  }
};

export const decodeUuid = (uuid: string): string => {
  const cleaned = uuid.replace(/-/g, '');
  if (!/^[0-9a-f]{32}$/i.test(cleaned)) {
    throw new Error('Invalid UUID format');
  }
  
  return `${cleaned.substring(0, 8)}-${cleaned.substring(8, 12)}-${cleaned.substring(12, 16)}-${cleaned.substring(16, 20)}-${cleaned.substring(20, 32)}`;
};

export const encodeUrl = (str: string): string => {
  return encodeURIComponent(str);
};

export const decodeUrl = (str: string): string => {
  try {
    return decodeURIComponent(str);
  } catch {
    throw new Error('Invalid URL encoding');
  }
};

export const encodeBase64 = (str: string): string => {
  return btoa(unescape(encodeURIComponent(str)));
};

export const decodeBase64 = (str: string): string => {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    throw new Error('Invalid Base64 string');
  }
};

export function convertJsonOrToon(input: string): string {
  try {
    const parsed = JSON.parse(input);
    return encode(parsed, {  });
  } catch (_) {
    // Not JSON → try TOON
  }

  try {
    const parsed = decode(input);
    return JSON.stringify(parsed, null, 2);
  } catch (_) {
    // Not TOON either
  }

  return "Input is neither valid JSON nor valid TOON format.";
}
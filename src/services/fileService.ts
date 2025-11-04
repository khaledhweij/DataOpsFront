export function downloadZipFromBase64(base64: string): void {
  const byteArray = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  const blob = new Blob([byteArray], { type: "application/zip" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "downloaded.zip";
  link.click();
  URL.revokeObjectURL(link.href);
}

export function viewPdfFromBase64(pdfBase64: string): void {
  const byteArray = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));
  const blob = new Blob([byteArray], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  // Optionally revoke later; leaving for browser to handle while the tab is open.
}

export function viewHtmlFromBase64(htmlBase64: string): void {
  if (!htmlBase64.trim()) throw new Error("Content cannot be empty.");
  const html = atob(htmlBase64);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

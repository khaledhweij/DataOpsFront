// small wrapper for fetch calls used by MainPage
export async function postCompare(firstContent: string, secondContent: string) {
  const response = await fetch("/DataToolbox/compare", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Referrer-Policy": "origin-when-cross-origin" },
    body: JSON.stringify({ firstContent, secondContent }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || "Compare request failed");
  }

  return response.json();
}

/**
 * Generic backend call that posts raw body (string) to /DataToolbox/{action}
 * Returns response text.
 */
export async function postActionRaw(action: string, body: string): Promise<Response> {
  const url = `/DataToolbox/${action}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Referrer-Policy": "origin-when-cross-origin" },
    body,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || `Request to ${action} failed`);
  }

  return response;
}

/**
 * For actions that expect JSON payload (text transformations)
 */
export async function postActionJson(action: string, payload: unknown): Promise<string> {
  const response = await fetch(`/DataToolbox/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Referrer-Policy": "origin-when-cross-origin" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || `Request to ${action} failed`);
  }

  return response.text();
}

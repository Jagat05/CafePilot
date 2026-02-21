/**
 * API base URL. In the browser we use the current hostname so that
 * when opening the app from another device (e.g. mobile at http://192.168.1.80:3000),
 * requests go to http://192.168.1.80:8080 instead of localhost.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:8080`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
}

export function getApiUrl(path: string): string {
  const base = getApiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}/api${p}`;
}

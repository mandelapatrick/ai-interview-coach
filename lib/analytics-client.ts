const COOKIE_NAME = "ace_anon_id";

function getAnonymousId(): string {
  if (typeof document === "undefined") return "";

  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  if (match) return decodeURIComponent(match[1]);

  const id = crypto.randomUUID();
  document.cookie = `${COOKIE_NAME}=${id}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  return id;
}

export function track(eventName: string, properties: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  const anonymousId = getAnonymousId();

  // Fire and forget — don't block the UI
  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_name: eventName,
      properties,
      anonymous_id: anonymousId,
    }),
  }).catch(() => {
    // Silently fail — analytics should never break the app
  });
}

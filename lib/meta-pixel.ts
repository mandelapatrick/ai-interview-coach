export function trackMetaEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, params);
  }
}

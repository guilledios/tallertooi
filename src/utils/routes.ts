export function teacherUrl(): string {
  return `${window.location.origin}${window.location.pathname}#/teacher`;
}

export function joinUrl(sessionId: string): string {
  return `${window.location.origin}${window.location.pathname}#/join/${sessionId}`;
}

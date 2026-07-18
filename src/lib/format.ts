/** Display helpers shared across the UI. */

export function formatPhone(address: string): string {
  const m = address.match(/^\+1([0-9]{3})([0-9]{3})([0-9]{4})$/);
  if (m) return `(${m[1]}) ${m[2]}-${m[3]}`;
  return address;
}

export function formatTime(date: Date | null | undefined): string {
  if (!date) return "";
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  const withinWeek = now.getTime() - date.getTime() < 6 * 24 * 60 * 60 * 1000;
  if (withinWeek) {
    return date.toLocaleDateString([], { weekday: "long" });
  }
  return date.toLocaleDateString([], {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  });
}

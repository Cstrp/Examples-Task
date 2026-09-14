export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatDateOnly(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatTimeAgo(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const deltaMinutes = Math.max(0, (Date.now() - date.getTime()) / 60000);
  if (deltaMinutes < 60) {
    return `${Math.round(deltaMinutes)} min ago`;
  }

  const deltaHours = deltaMinutes / 60;
  if (deltaHours < 24) {
    return `${Math.round(deltaHours)} hr ago`;
  }

  const deltaDays = deltaHours / 24;
  return `${Math.round(deltaDays)} day ago`;
}

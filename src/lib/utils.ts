import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

export function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = parseISO(dateString);
  if (!isValid(date)) return "";
  return format(date, "MMM d, yyyy");
}

export function formatDateTime(dateString: string): string {
  const date = parseISO(dateString);
  if (!isValid(date)) return "";
  return format(date, "MMM d, yyyy h:mm a");
}

export function formatRelativeTime(dateString: string): string {
  const date = parseISO(dateString);
  if (!isValid(date)) return "";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function toISOString(date: Date): string {
  return date.toISOString();
}

export function classNames(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function getInitials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "high":
      return "var(--color-priority-high)";
    case "medium":
      return "var(--color-priority-medium)";
    case "low":
      return "var(--color-priority-low)";
    default:
      return "var(--color-text-tertiary)";
  }
}

import { ReactNode } from "react";
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

const defaultIcon = (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="8" y="16" width="48" height="40" rx="4" />
    <path d="M20 28h24M20 36h16" strokeLinecap="round" />
    <circle cx="32" cy="8" r="4" />
    <path d="M32 12v4" />
  </svg>
);

export function EmptyState({
  icon = defaultIcon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action}
    </div>
  );
}

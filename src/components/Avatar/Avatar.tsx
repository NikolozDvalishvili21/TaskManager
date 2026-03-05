import styles from "./Avatar.module.css";
import { classNames, getInitials } from "../../lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  return (
    <div className={classNames(styles.avatar, styles[size], className)}>
      {src ? (
        <img src={src} alt={name || "Avatar"} className={styles.image} />
      ) : (
        <span>{getInitials(name ?? null)}</span>
      )}
    </div>
  );
}

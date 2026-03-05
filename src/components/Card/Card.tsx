import { ReactNode, HTMLAttributes } from "react";
import styles from "./Card.module.css";
import { classNames } from "../../lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  interactive?: boolean;
  noPadding?: boolean;
}

export function Card({
  children,
  interactive = false,
  noPadding = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={classNames(
        styles.card,
        interactive && styles.interactive,
        noPadding && styles.noPadding,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

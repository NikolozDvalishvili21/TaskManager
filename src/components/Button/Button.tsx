import { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";
import { classNames } from "../../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  iconOnly?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  iconOnly = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={classNames(
        styles.button,
        styles[variant],
        styles[size],
        iconOnly && styles.iconOnly,
        fullWidth && styles.fullWidth,
        isLoading && styles.loading,
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className={styles.spinner} />}
      {leftIcon && !isLoading && <span>{leftIcon}</span>}
      {children}
      {rightIcon && !isLoading && <span>{rightIcon}</span>}
    </button>
  );
}

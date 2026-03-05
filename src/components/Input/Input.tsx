import {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
  forwardRef,
} from "react";
import styles from "./Input.module.css";
import { classNames } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <div className={styles.wrapper}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={styles.inputWrapper}>
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
          <input
            ref={ref}
            className={classNames(
              styles.input,
              !!leftIcon && styles.hasLeftIcon,
              !!rightIcon && styles.hasRightIcon,
              !!error && styles.error,
              className,
            )}
            {...props}
          />
          {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
        </div>
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className={styles.wrapper}>
        {label && <label className={styles.label}>{label}</label>}
        <textarea
          ref={ref}
          className={classNames(
            styles.input,
            styles.textarea,
            !!error && styles.error,
            className,
          )}
          {...props}
        />
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    );
  },
);

TextArea.displayName = "TextArea";

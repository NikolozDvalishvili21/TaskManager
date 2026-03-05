import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Toast.module.css";
import { useUIStore, Toast as ToastType } from "../../features/board/uiStore";
import { classNames } from "../../lib/utils";

const icons = {
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M16.667 5L7.5 14.167 3.333 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 6.667v3.333M10 13.333h.008M17.5 10a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 7.5v3.333M10 14.167h.008M8.575 3.217L1.517 15a1.667 1.667 0 001.425 2.5h14.116a1.667 1.667 0 001.425-2.5L11.425 3.217a1.667 1.667 0 00-2.85 0z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 13.333V10M10 6.667h.008M17.5 10a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

function ToastItem({ toast }: { toast: ToastType }) {
  const removeToast = useUIStore((state) => state.removeToast);

  return (
    <motion.div
      className={classNames(styles.toast, styles[toast.type])}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
    >
      <span className={styles.icon}>{icons[toast.type]}</span>
      <span className={styles.message}>{toast.message}</span>
      <button
        className={styles.closeButton}
        onClick={() => removeToast(toast.id)}
        aria-label="Dismiss"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M12 4L4 12M4 4l8 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const toasts = useUIStore((state) => state.toasts);

  return createPortal(
    <div className={styles.container}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}

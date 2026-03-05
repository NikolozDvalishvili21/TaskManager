import styles from "./Spinner.module.css";
import { classNames } from "../../lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
}

export function Spinner({ size = "md", fullPage = false }: SpinnerProps) {
  const spinner = <div className={classNames(styles.spinner, styles[size])} />;

  if (fullPage) {
    return (
      <div className={classNames(styles.container, styles.fullPage)}>
        {spinner}
      </div>
    );
  }

  return spinner;
}

export function LoadingContainer({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className={styles.container}>
      <Spinner size={size} />
    </div>
  );
}

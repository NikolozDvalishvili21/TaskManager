import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../features/auth/useAuth";
import styles from "./LoginPage.module.css";

export function LoginPage() {
  const { signInWithGoogle, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError("Failed to sign in with Google. Please try again.");
      console.error("Sign in error:", err);
    }
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.leftPanel}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.loginBox}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg
                width="28"
                height="28"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zM12 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zM12 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3z" />
              </svg>
            </div>
            <span className={styles.logoText}>TaskFlow</span>
          </div>

          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>
            Sign in to continue managing your tasks
          </p>

          <button
            className={styles.googleButton}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className={styles.googleIcon} viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? "Signing in..." : "Continue with Google"}
          </button>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.divider}>Why TaskFlow?</div>

          <div className={styles.features}>
            <div className={styles.feature}>
              <svg
                className={styles.featureIcon}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Intuitive Kanban boards</span>
            </div>
            <div className={styles.feature}>
              <svg
                className={styles.featureIcon}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Drag and drop task management</span>
            </div>
            <div className={styles.feature}>
              <svg
                className={styles.featureIcon}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Comments and attachments</span>
            </div>
            <div className={styles.feature}>
              <svg
                className={styles.featureIcon}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Beautiful dark mode</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className={styles.rightPanel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className={styles.rightContent}>
          <h2 className={styles.rightTitle}>Manage tasks with ease</h2>
          <p className={styles.rightDescription}>
            TaskFlow helps teams organize, track, and manage their work. Simple,
            flexible, and powerful.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

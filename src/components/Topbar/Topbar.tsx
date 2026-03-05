import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useThemeStore } from "../../features/board/themeStore";
import { useUIStore } from "../../features/board/uiStore";
import styles from "./Topbar.module.css";
import { classNames } from "../../lib/utils";

interface TopbarProps {
  title?: string;
}

export function Topbar({ title = "Board" }: TopbarProps) {
  const { theme, toggleTheme } = useThemeStore();
  const { isSidebarCollapsed, setMobileSidebarOpen, addToast } = useUIStore();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      addToast("Failed to sign out", "error");
    }
  };

  return (
    <header
      className={classNames(
        styles.topbar,
        isSidebarCollapsed && styles.sidebarCollapsed,
      )}
    >
      <div className={styles.left}>
        <button
          className={styles.menuButton}
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>
        <h1 className={styles.title}>{title}</h1>
      </div>
      <div className={styles.right}>
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="10" cy="10" r="4" />
              <path d="M10 2v2M10 16v2M18 10h-2M4 10H2M15.66 4.34l-1.42 1.42M5.76 14.24l-1.42 1.42M15.66 15.66l-1.42-1.42M5.76 5.76L4.34 4.34" />
            </svg>
          )}
        </button>
        <button className={styles.logoutButton} onClick={handleLogout}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              d="M6.75 15.75H3.75a1.5 1.5 0 01-1.5-1.5v-10.5a1.5 1.5 0 011.5-1.5h3M12 12.75L15.75 9 12 5.25M6.75 9h9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

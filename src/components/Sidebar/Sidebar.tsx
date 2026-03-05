import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { Avatar } from "../Avatar/Avatar";
import { useAuthStore } from "../../features/auth/authStore";
import { useUIStore } from "../../features/board/uiStore";
import { classNames } from "../../lib/utils";

const navItems = [
  {
    to: "/app/board",
    label: "Board",
    icon: (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="2" y="2" width="6" height="8" rx="1" />
        <rect x="12" y="2" width="6" height="6" rx="1" />
        <rect x="2" y="12" width="6" height="6" rx="1" />
        <rect x="12" y="10" width="6" height="8" rx="1" />
      </svg>
    ),
  },
  {
    to: "/app/settings",
    label: "Settings",
    icon: (
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="10" cy="10" r="3" />
        <path d="M10 2v2M10 16v2M18 10h-2M4 10H2M15.66 4.34l-1.42 1.42M5.76 14.24l-1.42 1.42M15.66 15.66l-1.42-1.42M5.76 5.76L4.34 4.34" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const {
    isSidebarCollapsed,
    isMobileSidebarOpen,
    toggleSidebar,
    setMobileSidebarOpen,
  } = useUIStore();

  return (
    <>
      <div
        className={classNames(
          styles.overlay,
          isMobileSidebarOpen && styles.visible,
        )}
        onClick={() => setMobileSidebarOpen(false)}
      />
      <aside
        className={classNames(
          styles.sidebar,
          isSidebarCollapsed && styles.collapsed,
          isMobileSidebarOpen && styles.mobileOpen,
        )}
      >
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zM12 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zM12 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-3z" />
              </svg>
            </div>
            <span className={styles.logoText}>TaskFlow</span>
          </div>
          <button
            className={styles.toggleButton}
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {isSidebarCollapsed ? (
                <path
                  d="M8 4l6 6-6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d="M12 4l-6 6 6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                classNames(styles.navItem, isActive && styles.navItemActive)
              }
              onClick={() => setMobileSidebarOpen(false)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navText}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <div className={styles.userSection}>
            <Avatar src={user?.photoURL} name={user?.displayName} size="md" />
            <div className={styles.userInfo}>
              <div className={styles.userName}>
                {user?.displayName || "User"}
              </div>
              <div className={styles.userEmail}>{user?.email}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

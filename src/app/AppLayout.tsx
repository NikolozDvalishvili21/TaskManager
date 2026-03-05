import { Outlet } from "react-router-dom";
import { Sidebar, Topbar, ToastContainer } from "../components";
import { useUIStore } from "../features/board/uiStore";
import styles from "./AppLayout.module.css";
import { classNames } from "../lib/utils";

export function AppLayout() {
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed);

  return (
    <div className={styles.layout}>
      <Sidebar />
      <Topbar />
      <main
        className={classNames(
          styles.main,
          isSidebarCollapsed && styles.sidebarCollapsed,
        )}
      >
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}

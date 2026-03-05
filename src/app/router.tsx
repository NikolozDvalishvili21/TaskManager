import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute, PublicRoute } from "./ProtectedRoute";
import { AppLayout } from "./AppLayout";
import { LoginPage } from "../pages/Login/LoginPage";
import { BoardPage } from "../pages/Board/BoardPage";
import { SettingsPage } from "../pages/Settings/SettingsPage";
import { TaskDetailPage } from "../pages/TaskDetail/TaskDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/app/board" replace />,
  },
  {
    element: <PublicRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/app",
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/app/board" replace />,
          },
          {
            path: "board",
            element: <BoardPage />,
          },
          {
            path: "task/:taskId",
            element: <TaskDetailPage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
]);

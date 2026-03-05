import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import { useThemeStore } from "./features/board/themeStore";
import { useEffect } from "react";

function App() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return <RouterProvider router={router} />;
}

export default App;

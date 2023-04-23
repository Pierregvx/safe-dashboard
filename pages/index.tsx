import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import { SafeThemeProvider } from "@safe-global/safe-react-components";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import React from "react";

const App = dynamic(
  () => {
    return import("./App");
  },
  { ssr: false }
);

const Home: NextPage = () => {
  return (
  <React.StrictMode>
    <SafeThemeProvider mode="dark">
      {(safeTheme) => (
        <ThemeProvider theme={safeTheme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      )}
    </SafeThemeProvider>
  </React.StrictMode>);
};

export default Home;

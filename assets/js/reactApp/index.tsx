import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Main from "./main";

// Render your React component instead

const root = createRoot(document.getElementById("app")!);
root.render(
  <StrictMode>
    <Main />
  </StrictMode>
);

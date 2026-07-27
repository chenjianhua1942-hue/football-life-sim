import React from "react";
import { createRoot } from "react-dom/client";
import GameV2 from "./GameV2";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GameV2 />
  </React.StrictMode>
);

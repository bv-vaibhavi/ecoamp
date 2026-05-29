import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import SplashScreen from "./components/SplashScreen";
import "./index.css";

function Root() {
  const [splashDone, setSplashDone] = useState(false);
  return splashDone ? <App /> : <SplashScreen onDone={() => setSplashDone(true)} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

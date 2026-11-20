import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ReportsProvider } from "./context/ReportsContext.jsx";
import { NotifProvider } from "./context/NotifContext.jsx";
import "./styles/global.css";
import "./styles/pages.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ReportsProvider>
          <NotifProvider>
            <App />
          </NotifProvider>
        </ReportsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
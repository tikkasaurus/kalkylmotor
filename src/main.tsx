import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app/App";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient.ts";
import { ThemeProvider } from "./lib/theme-context";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";
import { tokenProvider } from "./lib/tokenProvider";

const msalInstance = new PublicClientApplication(msalConfig);

// Initialize token provider with MSAL instance
tokenProvider.setMsalInstance(msalInstance);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ThemeProvider>
    </MsalProvider>
  </StrictMode>
);

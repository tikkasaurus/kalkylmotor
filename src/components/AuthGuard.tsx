import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { InteractionStatus } from "@azure/msal-browser";
import { useMsal } from "@azure/msal-react";
import { tokenProvider } from "@/lib/tokenProvider";
import { setRuntimeAuthMode } from "../lib/authMode";

interface AuthGuardProps {
  children: React.ReactNode;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";
/**
 * Validate Cookie or MSAL auth to keep 2 flows
 */
type AuthMode = "auto" | "msal" | "cookie";
const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE as AuthMode) ?? "auto";

async function checkCookieSession(): Promise<"cookie" | "msal"> {
  try {
    const res = await fetch(`${API_BASE_URL}/User/me`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    const contentType = res.headers.get("content-type") ?? "";

    // If we got HTML, it's almost certainly the login page after redirect
    if (contentType.includes("text/html")) return "msal";

    if (res.status === 200) return "cookie";
    if (res.status === 401 || res.status === 403) return "msal";

    // Om API är nere/oväntat
    return "msal";
  } catch {
    // Network/CORS/etc => troligen standalone => MSAL
    return "msal";
  }
}

const STORAGE_KEY = "kalkyl.authMode";

function setAuthMode(
  mode: "cookie" | "msal",
  setMode: React.Dispatch<React.SetStateAction<"cookie" | "msal" | null>>,
) {
  setMode(mode);
  setRuntimeAuthMode(mode);
  sessionStorage.setItem(STORAGE_KEY, mode);
}
function getCachedAuthMode(): "cookie" | "msal" | null {
  const v = sessionStorage.getItem(STORAGE_KEY);
  return v === "cookie" || v === "msal" ? v : null;
}

/**
 * Authentication Guard Component
 * Protects routes by ensuring user is authenticated
 * Automatically redirects to login if not authenticated
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const [mode, setMode] = useState<"cookie" | "msal" | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Forced via env
        if (AUTH_MODE === "cookie" || AUTH_MODE === "msal") {
          if (!cancelled) setAuthMode(AUTH_MODE, setMode);
          return;
        }

        // AUTO: reuse decision for this tab
        const cached = getCachedAuthMode();
        if (cached) {
          if (!cancelled) setAuthMode(cached, setMode);
          return;
        }

        // AUTO: decide once
        const decided = await checkCookieSession(); // "cookie" | "msal"
        if (!cancelled) setAuthMode(decided, setMode);
      } catch {
        if (!cancelled) setAuthMode("msal", setMode);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (mode === null) {
    return <LoadingScreen text="Loading..." />;
  }

  if (mode === "cookie") {
    // Cookie-mode: ingen MSAL, rendera direkt.
    // Om ni vill: gör en extra redirect här om ni vill tvinga login vid 401 (men vi har redan checkat).
    return <>{children}</>;
  }

  // mode === "msal"
  return <MsalGuard>{children}</MsalGuard>;
}

/** MSAL-del ligger i samma fil, men som separat komponent så hooks är safe */
const MSAL_LOGIN_STARTED_KEY = "kalkyl.msal.loginStarted";

export function MsalGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, login, account } = useAuth();
  const { inProgress, instance, accounts } = useMsal();

  const loginStartedRef = useRef(false);

  useEffect(() => {
    tokenProvider.setAccount(account ?? null);
  }, [account]);

  useEffect(() => {
    // MSAL måste vara helt "idle" innan vi gör något
    if (inProgress !== InteractionStatus.None) return;

    // Om MSAL redan har ett account så ska vi INTE trigga login
    const hasAccount =
      (accounts?.length ?? 0) > 0 || instance.getAllAccounts().length > 0;

    if (hasAccount) return;

    // Förhindra oändlig loop: trigga bara login en gång
    const alreadyStarted =
      loginStartedRef.current ||
      sessionStorage.getItem(MSAL_LOGIN_STARTED_KEY) === "1";

    if (alreadyStarted) return;

    loginStartedRef.current = true;
    sessionStorage.setItem(MSAL_LOGIN_STARTED_KEY, "1");

    login();
  }, [inProgress, accounts, instance, login]);

  // När vi väl är autentiserade kan du rensa flaggan (valfritt)
  useEffect(() => {
    if (isAuthenticated) {
      sessionStorage.removeItem(MSAL_LOGIN_STARTED_KEY);
    }
  }, [isAuthenticated]);

  if (inProgress !== InteractionStatus.None) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) return <>{children}</>;

  return <div>Redirecting to login…</div>;
}

function LoadingScreen({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

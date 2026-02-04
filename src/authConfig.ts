export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID,
    authority:
      "https://login.microsoftonline.com/6169ca83-37bf-4372-8d32-a7a754f87192/v2.0",
    redirectUri: import.meta.env.VITE_REDIRECT_URI,
  },
};

// when logging in (for UI):
export const loginRequest = {
  scopes: ["openid", "profile", "offline_access", "User.Read"],
};

// when calling your API:
export const apiRequest = {
  scopes: ["api://dev-brikkz/user_impersonation"],
};

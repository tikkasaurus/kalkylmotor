export type RuntimeAuthMode = "cookie" | "msal";

let mode: RuntimeAuthMode = "msal";

export function setRuntimeAuthMode(next: RuntimeAuthMode) {
  mode = next;
}

export function getRuntimeAuthMode(): RuntimeAuthMode {
  return mode;
}

const allowedAuthMessageKeys = new Set(["auth.checkEmail", "auth.resetSent", "auth.accountCreated"]);

export function getSafeAuthMessageKey(message?: string) {
  if (!message) {
    return undefined;
  }

  return allowedAuthMessageKeys.has(message) ? message : undefined;
}

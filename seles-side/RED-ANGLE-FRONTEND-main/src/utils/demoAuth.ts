/**
 * Utility to strictly distinguish between unauthorized demo portal and authorized real portals.
 */

export const isUnauthorizedDemoPortal = (): boolean => {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");
  const isDemoFlag = localStorage.getItem("isDemoPortal") === "true";

  // If user has a real authorization token (not demo-portal-token), this is 100% an authorized portal!
  if (token && token !== "demo-portal-token" && !token.startsWith("demo-")) {
    // If the demo flag was lingering in localStorage from a previous demo session,
    // clear it immediately so authorized portals are NEVER disturbed.
    if (isDemoFlag) {
      localStorage.removeItem("isDemoPortal");
    }
    return false;
  }

  // It is ONLY unauthorized demo portal if explicitly set and token is the demo token (or absent in demo mode)
  return isDemoFlag && (token === "demo-portal-token" || !token);
};

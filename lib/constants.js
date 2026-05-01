export const AUTH_COOKIE_NAME = "expense_manager_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  }
}
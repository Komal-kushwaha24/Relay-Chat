const AUTH_COOKIE_NAME = 'token';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const getAuthCookieName = () => AUTH_COOKIE_NAME;

export const getAuthCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    // 'none' is required for cross-origin cookie sharing (Vercel → Render).
    // 'strict' blocks the cookie entirely on cross-site requests.
    // SameSite=None must always be paired with Secure=true.
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: SEVEN_DAYS_MS,
  };
};

export const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
};

export const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions());
};

export const setCookie = (res, name, value, options = {}) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    ...options,
  };

  res.cookie(name, value, cookieOptions);
};

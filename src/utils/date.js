export const cookieExpires1day = 24 * 60 * 60 * 1000;
export const cookieExpires15m = 15 * 60 * 1000;
export const cookieExpires10days = 10 * 24 * 60 * 60 * 1000;
export const thirtyDaysFromNow = () =>
  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

export const fiveMinutesAgo = () => new Date(Date.now() - 5 * 60 * 1000);

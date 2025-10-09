export const APPLICATION_ROUTING = () => {
  return {
    ERRORS: {
      400: "/error/400",
      401: "/error/401",
      403: "/error/403",
      404: "/error/404",
      500: "/error/500",
    },
    USERS: {
      signin: "/signin",
      tap: "/api/v1/users/tap",
    },
    ACCOUNTS: {
      forgotPassword: "/account/forgot-password",
      otp: "/account/otp",
      signup: "/account/signup",
      afterSignup: "/",
    },
  };
};

export const isPhone = (value: string) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
  return phoneRegex.test(value);
};

export const isEmail = (value: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

export const otpValueGen = (exponent: number = 5) => {
  const higherEx = Math.pow(10, exponent) - 1;
  const value = Math.pow(10, exponent - 1);
  const sub = higherEx - value;
  return Math.floor(value + sub * Math.random()).toString();
  // return Math.floor(10000 + (99999 - 10000) * Math.random()).toString();
};

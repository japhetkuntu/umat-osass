export const isValidNewPassword = (password: string): boolean =>
  password.length >= 12 && password.length <= 72;

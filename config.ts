export const TOKEN = process.env.token as string;
export const REJECT = "❌";
export const ACCEPT = "✅";
export const PREFIX = "*";
export const URL_REGEX = new RegExp(
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi,
);

export default {
  TOKEN,
  REJECT,
  ACCEPT,
  PREFIX,
  URL_REGEX,
};

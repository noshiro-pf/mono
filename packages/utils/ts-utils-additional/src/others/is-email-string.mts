export const isEmailString = (str: string): boolean =>
  // eslint-disable-next-line no-useless-escape,require-unicode-regexp,unicorn/better-regex, security/detect-unsafe-regex
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    str,
  );

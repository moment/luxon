import { INVALID_IANA_ZONE, setErrorFormatter } from "../errors.js";

const errors = {
  [INVALID_IANA_ZONE]: ({ name }) => `${name} is not a valid IANA zone name.`,
};

export function fancyErrorFormatter(code, args) {
  return errors[code]?.(args) ?? `${code}(${JSON.stringify(args)})`;
}

setErrorFormatter(fancyErrorFormatter);

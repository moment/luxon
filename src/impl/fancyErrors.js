import { INVALID_ZONE_NAME, setErrorFormatter } from "../errors.js";

const errors = {
  [INVALID_ZONE_NAME]: ({ name }) => `${name} is not a valid IANA zone name.`,
};

export function fancyErrorFormatter(code, args) {
  return errors[code]?.(args) ?? `${code}(${JSON.stringify(args)})`;
}

setErrorFormatter(fancyErrorFormatter);

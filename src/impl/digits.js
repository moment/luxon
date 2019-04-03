export const numberingSystemsUTF16 = {
  arab: [1632, 1641],
  arabext: [1776, 1785],
  bali: [6992, 7001],
  beng: [2534, 2543],
  deva: [2406, 2415],
  fullwide: [65296, 65305],
  gujr: [2790, 2799],
  hanidec: [12295, 19968, 20108, 19977, 22235, 20116, 20845, 19971, 20843, 20061],
  khmr: [6112, 6121],
  knda: [3302, 3311],
  laoo: [3792, 3801],
  latn: [48, 57],
  limb: [6470, 6479],
  mlym: [3430, 3439],
  mong: [6160, 6169],
  mymr: [4160, 4169],
  orya: [2918, 2927],
  tamldec: [3046, 3055],
  telu: [3174, 3183],
  thai: [3664, 3673],
  tibt: [3872, 3881]
};

export function parseDigits(str) {
  let value = parseInt(str, 10);
  if (isNaN(value)) {
    value = "";
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);

      const index = numberingSystemsUTF16.hanidec.findIndex(v => v === code);
      if (index !== -1) {
        value += index;
      } else {
        for (const key in numberingSystemsUTF16) {
          const [min, max] = numberingSystemsUTF16[key];
          if (code >= min && code <= max) {
            value += code - min;
          }
        }
      }
    }
    return parseInt(value, 10);
  } else {
    return value;
  }
}

export function digitRegex({ numberingSystem }, append = "") {
  return new RegExp(`${getNuRe(numberingSystem)}${append}`);
}

function getNuRe(numberingSystem) {
  const nu = numberingSystemsUTF16[numberingSystem || "latn"];
  if (nu.length === 2) {
    return `[${String.fromCharCode(nu[0])}-${String.fromCharCode(nu[1])}]`;
  }
  return `[${nu.map(h => String.fromCharCode(h)).join("|")}]`;
}

function hasUserAgentBrand(brand) {
  return !!globalThis?.navigator?.userAgentData?.brands?.some((data) => data.brand === brand);
}

function isNodeMajorVersion(version) {
  return !!globalThis?.process?.versions?.node?.startsWith(version + ".");
}

const userAgent = globalThis?.navigator?.userAgent ?? "";
const isChromium = hasUserAgentBrand("Chromium");
const isFirefox = /Gecko\/\d{3}/.test(userAgent);
const isSafari = !isChromium && /AppleWebKit\/\d{3}/.test(userAgent);
const isNode20 = isNodeMajorVersion("20");

// When adding any special cases, add corresponding tests for their validity in validateSpecialCases.test.js

// locale "be" not supported in Chromium
// https://issues.chromium.org/issues/41471874
export const hasMissingLocaleBeSupport = isChromium;
export const hasMissingLocaleMySupport = isChromium;

// AM / PM is localized in older versions of CLDR for locale KN
export const hasOutdatedKannadaAmPmBehavior = isChromium || isNode20 || isSafari;
// AM / PM is localized in even older versions of CLDR for locale TA (currently only Safari)
export const hasOutdatedTamilAmPmBehavior = isSafari;

// Missing normalization of Etc/GMT to UTC in Safari
export const hasMissingEtcGmtNormalization = isSafari;

// Firefox does not support Locale.getWeekInfo
export const isMissingLocaleWeekInfo = isFirefox;

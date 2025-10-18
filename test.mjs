import { Zone, DateTime } from "./src/luxon.ts";

function accumDaysInMonth(year, month) {
  return (((275 * month) / 9) | 0) - 2 * (((month + 9) / 12) | 0) - 30;
}

function monthGuess(year, ord) {
  return ((9 * (ord + 31)) / 275) | 0;
}
function monthGuessR(year, ord) {
  return (9 * (ord + 31)) / 275;
}

function ordToDay(year, ord) {
  return Math.floor(275);
}

const year = 2025;
for (let i = 1; i <= 365; i++) {
  const d = new Date(Date.UTC(year, 0, i));
  console.log(`j |= computeOrdinalLookup(${year}, ${d.getUTCMonth() + 1}, ${d.getUTCDate()})`);
}

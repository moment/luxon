// import { Zone, DateTime } from "./src/luxon.ts";

const nf = new Intl.NumberFormat("en-US", {
  numberingSystem: "hanidec",
});

for (let i = 0; i <= 10; i++) {
  const f = nf.format(i);
  console.log(i, f, f.codePointAt(0));
}

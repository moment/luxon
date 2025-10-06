import childProcess from "node:child_process";

if (!process.env.IS_FORK) {
  console.log("Main", new Intl.DateTimeFormat().resolvedOptions().timeZone);
  childProcess.fork(new URL(import.meta.url), {
    env: {
      IS_FORK: true,
      LANG: "en_US",
      TZ: "America/New_York",
    },
  });
} else {
  console.log("Worker", new Intl.DateTimeFormat().resolvedOptions().timeZone);
}
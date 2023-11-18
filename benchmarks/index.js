import dateTimeSuites from "./datetime.js";
import infoSuites from "./info.js";

const allSuites = [...dateTimeSuites, ...infoSuites];

async function runAllSuites() {
  for (const runSuite of allSuites) {
    await runSuite();
  }
}

runAllSuites();

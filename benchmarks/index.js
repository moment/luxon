import dateTimeSuites from "./datetime";
import infoSuites from "./info";

const allSuites = [...dateTimeSuites, ...infoSuites];

async function runAllSuites() {
  for (const runSuite of allSuites) {
    await runSuite();
  }
}

runAllSuites();

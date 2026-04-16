import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    coverage: {
      reportsDirectory: resolve(__dirname, "build/coverage"),
      include: ["src/**"],
    },
    env: {
      LANG: "en_US",
      TZ: "America/New_York",
    },
    projects: [
      {
        test: {
          name: "node",
          environment: "node",
          setupFiles: ["test/setupTests.js"],
        },
      },
      {
        test: {
          name: "browsers",
          setupFiles: ["test/setupTests.js"],
          browser: {
            provider: playwright({
              contextOptions: {
                locale: "en-US",
                timezoneId: "America/New_York",
              },
            }),
            enabled: true,
            headless: true,
            screenshotFailures: false,
            instances: [
              {
                browser: "chromium",
              },
              {
                browser: "firefox",
              },
              {
                browser: "webkit",
              },
            ],
          },
        },
      },
    ],
  },
});

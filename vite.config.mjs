import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import terser from "@rollup/plugin-terser";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * @type {import('@rollup/plugin-terser').Options}
 */
const terserOptions = {
  format: {
    comments: "some",
  },
};

export default defineConfig({
  test: {
    coverage: {
      reportsDirectory: resolve(__dirname, "build/coverage"),
      include: ["src/**"]
    },
    projects: [
      {
        name: "node",
        test: {
          environment: "node",
        }
      },
      {
        test: {
          name: "browsers",
          browser: {
            provider: 'playwright',
            enabled: true,
            headless: true,
            instances: [
              {
                browser: 'chromium',
                context: {
                  locale: "en-US",
                  timeZoneId: "America/New_York",
                }
              }
            ]
          }
        }
      }
    ]
  },
  build: {
    sourcemap: true,
    minify: false, // we minify manually
    lib: {
      entry: resolve(__dirname, "src/luxon.js"),
      name: "luxon",
      fileName: "luxon",
    },
    target: ["es2020"],
    outDir: "build",
    rollupOptions: {
      output: [
        {
          format: "es",
          entryFileNames: "es6/[name].mjs",
          exports: "named",
        },
        {
          format: "es",
          entryFileNames: "es6/[name].min.mjs",
          exports: "named",
          plugins: [terser(terserOptions)],
        },
        {
          format: "umd",
          entryFileNames: "umd/[name].js",
          name: "luxon",
          exports: "named",
        },
        {
          format: "umd",
          entryFileNames: "umd/[name].min.js",
          name: "luxon",
          exports: "named",
          plugins: [terser(terserOptions)],
        },
        {
          format: "cjs",
          entryFileNames: "cjs/[name].js",
          exports: "named",
        },
        {
          format: "cjs",
          entryFileNames: "cjs/[name].min.js",
          exports: "named",
          plugins: [terser(terserOptions)],
        },
      ],
    },
  },
});

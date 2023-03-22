// SPDX-License-Identifier: MPL-2.0
// SPDX-FileCopyrightText: 2023 Lynn Kirby

import esbuild from "esbuild";
import { execa } from "execa";
import { task } from "hereby";

//=============================================================================
// Build.

export const buildDTS = task({
  name: "build-dts",
  description: "Build type definitions",
  async run() {
    await execa("tsc", ["-p", "src/tsconfig.json"], { preferLocal: true });
    // TODO: Bundle with api-extractor.
  },
});

export const buildJS = task({
  name: "build-js",
  description: "Build code bundle",
  async run() {
    // TODO: Remove asserts.
    await esbuild.build({
      entryPoints: ["src/index.ts"],
      outfile: "dist/charconv.js",
      bundle: true,
      platform: "neutral",
      target: "es2022",
      format: "esm",
      sourcemap: true,
    });
  },
});

export const build = task({
  name: "build",
  description: "Build package",
  dependencies: [buildDTS, buildJS],
});

//=============================================================================
// Testing.

// TODO:
// - Watch mode (`--watch`)
// - Select variant

const variant = "bundle";

export const testNode = task({
  name: "test-node",
  description: "Run tests with Node.js",
  async run() {
    await execa("vitest", ["run"], {
      env: {
        ...process.env,
        CHARCONV_VARIANT: variant,
      },
      preferLocal: true,
      stdout: "inherit",
      stderr: "inherit",
    });
  },
});

export const testChrome = task({
  name: "test-chrome",
  description: "Run tests on Chrome",
  async run() {
    const args = ["run", "--browser.name=chrome", "--browser.headless"];
    await execa("vitest", args, {
      env: {
        ...process.env,
        CHARCONV_VARIANT: variant,
      },
      preferLocal: true,
      stdout: "inherit",
      stderr: "inherit",
    });
  },
});

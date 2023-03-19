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
    await esbuild.build({
      entryPoints: ["src/index.ts"],
      outfile: "dist/charconv.js",
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

export const test = task({
  name: "test",
  description: "Run tests",
  async run() {
    await execa("vitest", ["run"], {
      preferLocal: true,
      stdout: "inherit",
      stderr: "inherit",
    });
  },
});

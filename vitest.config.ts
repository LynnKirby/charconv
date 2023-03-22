// SPDX-License-Identifier: MPL-2.0
// SPDX-FileCopyrightText: 2023 Lynn Kirby

import { defineConfig } from "vitest/config";
import path from "node:path";

const useBundle = process.env.CHARCONV_VARIANT === "bundle";
const withUnitTests = !useBundle;

const testGlobs = ["tests/*.test.ts"];

if (withUnitTests) {
  testGlobs.push("src/*.test.ts");
}

export default defineConfig({
  test: {
    include: testGlobs,
  },
  resolve: {
    alias: {
      charconv: path.resolve(
        useBundle ? "./dist/charconv.js" : "./src/index.ts",
      ),
    },
  },
});

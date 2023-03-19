// SPDX-License-Identifier: MPL-2.0
// SPDX-FileCopyrightText: 2023 Lynn Kirby

import { test, expect } from "vitest";
import { sum } from "./index.ts";

test("sum(1, 1) === 2", () => {
  expect(sum(1, 1)).toEqual(2);
});

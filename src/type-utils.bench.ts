// SPDX-License-Identifier: MPL-2.0
// SPDX-FileCopyrightText: 2023 Lynn Kirby

import { describe, bench, expect } from "vitest";
import { isSharedArrayBuffer, isUnsharedArrayBuffer } from "./type-utils.ts";

const ab = new ArrayBuffer(1);
const sab = new SharedArrayBuffer(1);

describe("is ArrayBuffer", () => {
  bench("instanceof ArrayBuffer", () => {
    expect(ab instanceof ArrayBuffer).toBe(true);
  });

  bench("isUnsharedArrayBuffer()", () => {
    expect(isUnsharedArrayBuffer(ab)).toBe(true);
  });
});

describe("is not ArrayBuffer", () => {
  bench("instanceof ArrayBuffer", () => {
    expect(sab instanceof ArrayBuffer).toBe(false);
  });

  bench("isUnsharedArrayBuffer()", () => {
    expect(isUnsharedArrayBuffer(sab)).toBe(false);
  });
});

describe("is SharedArrayBuffer", () => {
  bench("instanceof SharedArrayBuffer", () => {
    expect(sab instanceof SharedArrayBuffer).toBe(true);
  });

  bench("isSharedArrayBuffer()", () => {
    expect(isSharedArrayBuffer(sab)).toBe(true);
  });
});

describe("is not SharedArrayBuffer", () => {
  bench("instanceof SharedArrayBuffer", () => {
    expect(ab instanceof SharedArrayBuffer).toBe(false);
  });

  bench("isSharedArrayBuffer()", () => {
    expect(isSharedArrayBuffer(ab)).toBe(false);
  });
});

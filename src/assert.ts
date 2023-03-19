// SPDX-License-Identifier: MPL-2.0
// SPDX-FileCopyrightText: 2023 Lynn Kirby

class AssertionError extends Error {}

/** @internal */
export default function assert(
  condition: unknown,
  message?: string,
): asserts condition {
  if (!condition) {
    debugger;
    let m = "Assertion failed";
    if (message) {
      m += ": " + message;
    }
    throw new AssertionError(m);
  }
}

assert.unreachable = function unreachable(): never {
  debugger;
  throw new AssertionError("Assertion failed: unreachable statement");
};

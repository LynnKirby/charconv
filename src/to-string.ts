// SPDX-License-Identifier: MPL-2.0
// SPDX-FileCopyrightText: 2023 Lynn Kirby

// This module provides the underlying functions that convert typed arrays into
// strings. Unfortunately, there is no `String.fromCharCodeArray` that would do
// this in the most efficient way possible.

// Function.apply creates an argument for each item in the given array. This
// will result in stack overflow if the array is too long. Note that modern JS
// engines won't actually create variables on a stack when calling
// Function.apply so the size is fairly large.
const FROM_CHAR_CODE_CHUNK_SIZE = 100_000;

// TODO: Use more efficient platform-specific methods of conversion.

/**
 * Convert a UTF-16 encoded array to a string using `String.fromCharCode`.
 */
export function utf16ToString(source: Uint16Array): string {
  let result = "";

  while (source.length > 0) {
    const chunk = source.subarray(0, FROM_CHAR_CODE_CHUNK_SIZE);
    source = source.subarray(FROM_CHAR_CODE_CHUNK_SIZE);
    // Function.apply allows calling with typed arrays but the type definitions
    // don't show that.
    result += String.fromCharCode.apply(null, chunk as any);
  }

  return result;
}

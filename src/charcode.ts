// SPDX-License-Identifier: MPL-2.0
// SPDX-FileCopyrightText: 2023 Lynn Kirby

/**
 * Unicode code point constants.
 * @internal
 */
export const enum CharCode {
  FirstHighSurrogate = 0xd800,
  LastHighSurrogate = 0xdbff,

  FirstLowSurrogate = 0xdc00,
  LastLowSurrogate = 0xdfff,

  ByteOrderMark = 0xfeff,
  Replacement = 0xfffd,
  FirstNoncharacter = 0xfffe,
  SecondNoncharacter = 0xffff,
}

/**
 * Unicode character string constants.
 * @internal
 */
export const enum CharStr {
  FirstHighSurrogate = "\ud800",
  LastHighSurrogate = "\udbff",

  FirstLowSurrogate = "\udc00",
  LastLowSurrogate = "\udfff",

  ByteOrderMark = "\ufeff",
  Replacement = "\ufffd",
  FirstNoncharacter = "\ufffe",
  SecondNoncharacter = "\ufffe",
}

/** @internal */
export function isSurrogate(c: number): boolean {
  return c >= CharCode.FirstHighSurrogate && c <= CharCode.LastLowSurrogate;
}

/** @internal */
export function isHighSurrogate(c: number): boolean {
  return c >= CharCode.FirstHighSurrogate && c <= CharCode.LastHighSurrogate;
}

/** @internal */
export function isLowSurrogate(c: number): boolean {
  return c >= CharCode.FirstLowSurrogate && c <= CharCode.LastLowSurrogate;
}

// SPDX-License-Identifier: MPL-2.0
// SPDX-FileCopyrightText: 2023 Lynn Kirby

// This module isolates platform-specific code.

/** @internal */
export const platformIsLittleEndian =
  new Uint16Array(new Uint8Array([0, 1]).buffer)[0] === 0x0100;

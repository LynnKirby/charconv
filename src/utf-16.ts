// SPDX-License-Identifier: MPL-2.0
// SPDX-FileCopyrightText: 2023 Lynn Kirby

import assert from "./assert.ts";
import { CharCode, isHighSurrogate, isLowSurrogate } from "./charcode.ts";
import type { MultiByteDecodeResult } from "./multibyte-decoder.ts";
import { platformIsLittleEndian } from "./platform.ts";
import { utf16ToString } from "./to-string.ts";

const enum UTF16State {
  BOMSniff = 0,
  LE,
  BE,
}

export const decodeUTF16LE = makeDecoder(true);
export const decodeUTF16BE = makeDecoder(false);

export function decodeUTF16(
  source: Uint8Array,
  state: number,
): MultiByteDecodeResult {
  if (state === UTF16State.BOMSniff) {
    if (source.length < 2) {
      return {
        need: 2,
        read: 0,
        value: "",
        state: UTF16State.BOMSniff,
        invalid: false,
      };
    }

    const b0 = source[0]!;
    const b1 = source[1]!;
    const codeUnitLE = b0 + (b1 << 8);

    if (codeUnitLE === CharCode.ByteOrderMark) {
      return decodeUTF16LE(source);
    }

    return decodeUTF16BE(source);
  }

  if (state === UTF16State.LE) {
    return decodeUTF16LE(source);
  } else if (state === UTF16State.BE) {
    return decodeUTF16BE(source);
  } else {
    assert.unreachable();
  }
}

function makeDecoder(littleEndian: boolean) {
  const state = littleEndian ? UTF16State.LE : UTF16State.BE;

  return (source: Uint8Array): MultiByteDecodeResult => {
    // We need to allocate and use a buffer if either:
    // - The source is unaligned (therefore can't be viewed as a Uint16Array).
    // - The encoding and platform endianness are different.
    const useBuffer =
      source.byteOffset % 2 !== 0 || platformIsLittleEndian !== littleEndian;

    const buffer = useBuffer
      ? new Uint16Array(source.byteLength / 2)
      : new Uint16Array(
          source.buffer,
          source.byteOffset,
          source.byteLength / 2,
        );

    let read = 0; // in bytes

    function decode() {
      if (read === 0) return "";
      assert(read % 2 === 0);
      return utf16ToString(buffer.subarray(0, read / 2));
    }

    for (;;) {
      const remaining = source.length - read;

      // Source has less than a code unit.
      if (remaining < 2) {
        return {
          read,
          need: 2,
          value: decode(),
          state,
          invalid: false,
        };
      }

      // Decode first code unit.
      const b0 = source[read]!;
      const b1 = source[read + 1]!;
      const codeUnit = littleEndian ? b0 + (b1 << 8) : b1 + (b0 << 8);
      if (useBuffer) buffer[read / 2] = codeUnit;

      if (isHighSurrogate(codeUnit)) {
        // First code unit is a high surrogate at the end of the source.
        if (remaining < 4) {
          return {
            read,
            need: 4,
            value: decode(),
            state,
            invalid: false,
          };
        }

        // Decode second code unit.
        const b2 = source[read + 2]!;
        const b3 = source[read + 3]!;
        const lowCodeUnit = littleEndian ? b2 + (b3 << 8) : b3 + (b2 << 8);
        if (useBuffer) buffer[read / 2 + 1] = lowCodeUnit;

        // Code units are a paired surrogate. Continue decoding.
        if (isLowSurrogate(lowCodeUnit)) {
          read += 4;
          continue;
        }

        // Error: Second code unit is not a low surrogate.
        return {
          read,
          need: 2,
          value: decode(),
          state,
          invalid: true,
        };
      } else if (isLowSurrogate(codeUnit)) {
        // Error: First code unit is an unpaired low surrogate.
        return {
          read,
          need: 2,
          value: decode(),
          state,
          invalid: true,
        };
      } else {
        // First code unit a BMP character. Continue decoding.
        read += 2;
      }
    }
  };
}

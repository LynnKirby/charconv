// SPDX-License-Identifier: MPL-2.0
// SPDX-FileCopyrightText: 2023 Lynn Kirby

import { describe, it, expect } from "vitest";
import { CharStr } from "./charcode.ts";
import { MultiByteDecoder } from "./multibyte-decoder.ts";

function makeDecoder(byteLength: number) {
  return new MultiByteDecoder((source, state) => {
    let value = "";
    let read = 0;
    let invalid = false;

    outer: for (
      let i = 0;
      i < Math.floor(source.length / byteLength) * byteLength;
      i += byteLength
    ) {
      for (let j = 0; j < byteLength; j++) {
        if (source[i + j] !== state) {
          invalid = true;
          break outer;
        }
      }
      value += state.toString();
      read += byteLength;
      state++;
    }

    return {
      need: byteLength,
      read,
      value,
      state,
      invalid,
    };
  });
}

describe("Decoder", () => {
  it("decodes double-byte", () => {
    const decoder = makeDecoder(2);
    let result;

    result = decoder.end(new Uint8Array([0, 0]));
    expect(result).toEqual("0");

    result = decoder.end(new Uint8Array([0, 0, 1, 1]));
    expect(result).toEqual("01");

    result = decoder.end(new Uint8Array([0, 0, 1]));
    expect(result).toEqual("0" + CharStr.Replacement);

    result = decoder.end(new Uint8Array([0]));
    expect(result).toEqual(CharStr.Replacement);
  });

  it("decodes double-byte streaming", () => {
    const decoder = makeDecoder(2);
    let result;

    result = decoder.write(new Uint8Array([0, 0]));
    expect(result).toEqual("0");

    result = decoder.write(new Uint8Array([1, 1, 2]));
    expect(result).toEqual("1");

    result = decoder.write(new Uint8Array([2, 3, 3, 4]));
    expect(result).toEqual("23");

    result = decoder.end(new Uint8Array([4]));
    expect(result).toEqual("4");
  });

  it("decodes double-byte streaming with many empty chunks", () => {
    const decoder = makeDecoder(2);

    for (let i = 0; i < 10; i++) {
      expect(decoder.write(new Uint8Array())).toEqual("");
    }

    expect(decoder.end(new Uint8Array([0, 0]))).toEqual("0");
  });

  it("decodes completely invalid double-byte source", () => {
    let expected = "";
    let bytes = [];
    for (let i = 0; i < 100; i++) {
      expected += CharStr.Replacement;
      bytes.push(0xff);
    }

    const decoder = makeDecoder(2);
    const result = decoder.end(new Uint8Array(bytes));
    expect(result).toEqual(expected);
  });

  it("handles long sequence of invalid buffered bytes", () => {
    const decoder = makeDecoder(4);
    let result;

    result = decoder.write(new Uint8Array([0xff, 0xff, 0xff]));
    expect(result).toEqual("");

    result = decoder.end(new Uint8Array([0x00, 0x00, 0x00, 0x00]));
    expect(result).toEqual(CharStr.Replacement.repeat(3) + "0");
  });
});

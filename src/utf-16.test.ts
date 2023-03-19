// SPDX-License-Identifier: MPL-2.0
// SPDX-FileCopyrightText: 2023 Lynn Kirby

import { describe, it, expect } from "vitest";
import { CharStr } from "./charcode.ts";
import { decodeUTF16LE, decodeUTF16BE, decodeUTF16 } from "./utf-16.ts";

function encodeForTest(source: string, littleEndian: boolean): Uint8Array {
  const result = new Uint8Array(source.length * 2);
  const view = new DataView(result.buffer);
  for (let i = 0; i < source.length; i++) {
    view.setUint16(i * 2, source.charCodeAt(i)!, littleEndian);
  }
  return result;
}

for (const testCaseLittleEndian of [true, false]) {
  const name = testCaseLittleEndian ? "decodeUTF16LE()" : "decodeUTF16BE()";
  const decode = testCaseLittleEndian ? decodeUTF16LE : decodeUTF16BE;

  const make = (s: string) => encodeForTest(s, testCaseLittleEndian);

  describe(name, () => {
    it("decodes empty source", () => {
      const result = decode(new Uint8Array());
      expect(result.value ?? "").toEqual("");
      expect(result.read).toEqual(0);
      expect(result.need).toEqual(2);
      expect(result.invalid).toBe(false);
    });

    it("decodes single byte", () => {
      const result = decode(new Uint8Array([0x00]));
      expect(result.value ?? "").toEqual("");
      expect(result.read).toEqual(0);
      expect(result.need).toEqual(2);
      expect(result.invalid).toBe(false);
    });

    it("decodes BMP characters", () => {
      const result = decode(make("abc"));
      expect(result.value).toEqual("abc");
      expect(result.read).toEqual(6);
      expect(result.need).toEqual(2);
      expect(result.invalid).toBe(false);
    });

    it("decodes supplementary characters", () => {
      const result = decode(make("😺"));
      expect(result.value).toEqual("😺");
      expect(result.read).toEqual(4);
      expect(result.need).toEqual(2);
      expect(result.invalid).toBe(false);
    });

    it("decodes unaligned input", () => {
      const buffer = new Uint8Array(make("😺").byteLength + 1);
      buffer.set(make("😺"), 1);
      const source = buffer.subarray(1);
      expect(source.byteOffset % 2).toEqual(1);

      const result = decode(source);
      expect(result.value).toEqual("😺");
      expect(result.read).toEqual(4);
      expect(result.need).toEqual(2);
      expect(result.invalid).toBe(false);
    });

    it("detects high surrogate", () => {
      const source = make("a" + CharStr.FirstHighSurrogate);
      const result = decode(source);
      expect(result.value).toEqual("a");
      expect(result.read).toEqual(2);
      expect(result.need).toEqual(4);
      expect(result.invalid).toBe(false);
    });

    it("errors on unpaired high surrogate", () => {
      const source = make("a" + CharStr.FirstHighSurrogate + "b");
      const result = decode(source);
      expect(result.value).toEqual("a");
      expect(result.read).toEqual(2);
      expect(result.need).toEqual(2);
      expect(result.invalid).toBe(true);
    });

    it("errors on unpaired low surrogate", () => {
      const source = make("a" + CharStr.FirstLowSurrogate + "b");
      const result = decode(source);
      expect(result.value).toEqual("a");
      expect(result.read).toEqual(2);
      expect(result.need).toEqual(2);
      expect(result.invalid).toBe(true);
    });
  });
}

describe("decodeUTF16()", () => {
  it("decodes empty source", () => {
    const result = decodeUTF16(new Uint8Array(), 0);
    expect(result.value ?? "").toEqual("");
    expect(result.read).toEqual(0);
    expect(result.need).toEqual(2);
    expect(result.invalid).toBe(false);
  });

  it("decodes single byte", () => {
    const result = decodeUTF16(new Uint8Array([0x00]), 0);
    expect(result.value ?? "").toEqual("");
    expect(result.read).toEqual(0);
    expect(result.need).toEqual(2);
    expect(result.invalid).toBe(false);
  });

  it("decodes UTF-16BE without BOM", () => {
    let result = decodeUTF16(encodeForTest("no", false), 0);
    expect(result.value).toEqual("no");
    expect(result.read).toEqual(4);
    expect(result.need).toEqual(2);
    expect(result.invalid).toBe(false);

    result = decodeUTF16(encodeForTest("bom", false), result.state as any);
    expect(result.value).toEqual("bom");
    expect(result.read).toEqual(6);
    expect(result.need).toEqual(2);
    expect(result.invalid).toBe(false);
  });

  it("decodes UTF-16BE with BOM", () => {
    const str = CharStr.ByteOrderMark + "with";
    let result = decodeUTF16(encodeForTest(str, false), 0);
    expect(result.value).toEqual(str);
    expect(result.read).toEqual(10);
    expect(result.need).toEqual(2);
    expect(result.invalid).toBeFalsy();

    result = decodeUTF16(encodeForTest("bom", false), result.state as any);
    expect(result.value).toEqual("bom");
    expect(result.read).toEqual(6);
    expect(result.need).toEqual(2);
    expect(result.invalid).toBe(false);
  });

  it("decodes UTF-16LE with BOM", () => {
    const str = CharStr.ByteOrderMark + "with";
    let result = decodeUTF16(encodeForTest(str, true), 0);
    expect(result.value).toEqual(str);
    expect(result.read).toEqual(10);
    expect(result.need).toEqual(2);
    expect(result.invalid).toBe(false);

    result = decodeUTF16(encodeForTest("bom", true), result.state as any);
    expect(result.value).toEqual("bom");
    expect(result.read).toEqual(6);
    expect(result.need).toEqual(2);
    expect(result.invalid).toBe(false);
  });
});

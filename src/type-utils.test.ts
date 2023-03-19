// SPDX-License-Identifier: MPL-2.0
// SPDX-FileCopyrightText: 2023 Lynn Kirby

import { describe, it, expect } from "vitest";
import {
  isSharedArrayBuffer,
  isUnsharedArrayBuffer,
  wrapBufferSource,
} from "./type-utils.ts";

describe("isUnsharedArrayBuffer()", () => {
  it("is true for ArrayBuffer", () => {
    const ab = new ArrayBuffer(0);
    expect(isUnsharedArrayBuffer(ab)).toBe(true);
  });

  it("is true for detached ArrayBuffer", () => {
    const ab = new ArrayBuffer(0);
    structuredClone(ab, { transfer: [ab] });
    expect(isUnsharedArrayBuffer(ab)).toBe(true);
  });

  it("is false for SharedArrayBuffer", () => {
    const ab = new SharedArrayBuffer(0);
    expect(isUnsharedArrayBuffer(ab)).toBe(false);
  });
});

describe("isSharedArrayBuffer()", () => {
  it("is true for SharedArrayBuffer", () => {
    const ab = new SharedArrayBuffer(0);
    expect(isSharedArrayBuffer(ab)).toBe(true);
  });

  it("is false for ArrayBuffer", () => {
    const ab = new ArrayBuffer(0);
    expect(isSharedArrayBuffer(ab)).toBe(false);
  });
});

describe("wrapBufferSource()", () => {
  it("can wrap Uint8Array", () => {
    const source = new Uint8Array([0xff, 0x00]);
    const result = wrapBufferSource(source);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result[0]).toEqual(0xff);
    expect(result[1]).toEqual(0x00);
  });

  it("can wrap Uint16Array", () => {
    const source = new Uint16Array([0xffff, 0x0000]);
    const result = wrapBufferSource(source);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result[0]).toEqual(0xff);
    expect(result[1]).toEqual(0xff);
    expect(result[2]).toEqual(0x00);
    expect(result[3]).toEqual(0x00);
  });

  it("can wrap ArrayBuffer", () => {
    const source = new ArrayBuffer(2);
    new Uint8Array(source)[0] = 0xff;
    new Uint8Array(source)[1] = 0x00;
    const result = wrapBufferSource(source);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result[0]).toEqual(0xff);
    expect(result[1]).toEqual(0x00);
  });

  it("can wrap SharedArrayBuffer", () => {
    const source = new SharedArrayBuffer(2);
    new Uint8Array(source)[0] = 0xff;
    new Uint8Array(source)[1] = 0x00;
    const result = wrapBufferSource(source);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result[0]).toEqual(0xff);
    expect(result[1]).toEqual(0x00);
  });

  it("can wrap Node.js Buffer", () => {
    const source = Buffer.from([0xff, 0x00]);
    const result = wrapBufferSource(source);
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result[0]).toEqual(0xff);
    expect(result[1]).toEqual(0x00);
  });

  it("throws on invalid types", () => {
    expect(() => wrapBufferSource(undefined!)).toThrow("not an ArrayBuffer");
    expect(() => wrapBufferSource(null!)).toThrow("not an ArrayBuffer");
    expect(() =>
      wrapBufferSource({ buffer: {}, byteLength: 0, byteOffset: 0 } as any),
    ).toThrow("not an ArrayBuffer");
  });

  it("throws on detached Uint8Array", () => {
    const source = new Uint8Array(1);
    structuredClone(source, { transfer: [source.buffer] });
    expect(() => wrapBufferSource(source)).toThrow(
      "view on a detached ArrayBuffer",
    );
  });

  it("throws on detached Uint16Array", () => {
    const source = new Uint16Array(1);
    structuredClone(source, { transfer: [source.buffer] });
    expect(() => wrapBufferSource(source)).toThrow(
      "view on a detached ArrayBuffer",
    );
  });

  it("throws on detached ArrayBuffer", () => {
    const source = new ArrayBuffer(1);
    structuredClone(source, { transfer: [source] });
    expect(() => wrapBufferSource(source)).toThrow("a detached ArrayBuffer");
  });
});

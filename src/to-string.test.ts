// SPDX-License-Identifier: MPL-2.0
// SPDX-FileCopyrightText: 2023 Lynn Kirby

import { describe, it, expect } from "vitest";
import { utf16ToString } from "./to-string.ts";

function convert(s: string): Uint16Array {
  const units = [];
  for (let i = 0; i < s.length; i++) {
    units.push(s.charCodeAt(i));
  }
  return new Uint16Array(units);
}

describe("utf16ToString()", () => {
  it("converts empty source", () => {
    const source = new Uint16Array();
    const result = utf16ToString(source);
    expect(result).toEqual("");
  });

  it("converts small source", () => {
    const string = "small";
    const source = convert(string);
    const result = utf16ToString(source);
    expect(result).toEqual(string);
  });

  it("converts large source", () => {
    const source = new Uint16Array(10_000_000);
    for (let i = 0; i < source.length; i++) {
      source[i] = 1;
    }
    source[0] = 2;
    source[source.length - 1] = 2;

    const result = utf16ToString(source);
    expect(result[0]).toEqual("\x02");
    expect(result[1]).toEqual("\x01");
    expect(result[result.length - 2]).toEqual("\x01");
    expect(result[result.length - 1]).toEqual("\x02");
    expect(result.length).toEqual(source.length);
  });
});

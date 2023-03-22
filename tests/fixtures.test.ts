// SPDX-License-Identifier: MPL-2.0
// SPDX-FileCopyrightText: 2023 Lynn Kirby

import { describe, it, expect } from "vitest";
import fs from "node:fs/promises";
import url from "node:url";

import * as charconv from "charconv";

const fixturesDir = new URL("./fixtures/", import.meta.url);

const fixtures = [
  {
    original: "wikipedia-en/utf-8",
    encoded: "wikipedia-en/utf-16be",
    encodings: ["utf-16", "utf-16be"],
  },
  {
    original: "wikipedia-en/utf-8",
    encoded: "wikipedia-en/utf-16le",
    encodings: ["utf-16le"],
  },
  {
    original: "wikipedia-en-bom/utf-8",
    encoded: "wikipedia-en-bom/utf-16be",
    encodings: ["utf-16", "utf-16be"],
  },
  {
    original: "wikipedia-en-bom/utf-8",
    encoded: "wikipedia-en-bom/utf-16le",
    encodings: ["utf-16", "utf-16le"],
  },
];

const byteCache = new Map<string, Uint8Array>();
const stringCache = new Map<string, string>();

async function readBytes(file: string): Promise<Uint8Array> {
  if (byteCache.has(file)) return byteCache.get(file)!;
  let bytes: Uint8Array;
  if (fixturesDir.protocol === "file:") {
    const path = url.fileURLToPath(new URL(file, fixturesDir));
    bytes = await fs.readFile(path);
  } else {
    const response = await fetch(new URL(file, fixturesDir));
    const buffer = await response.arrayBuffer();
    bytes = new Uint8Array(buffer);
  }
  byteCache.set(file, bytes);
  return bytes;
}

async function readText(file: string): Promise<string> {
  if (stringCache.has(file)) return stringCache.get(file)!;
  const bytes = await readBytes(file);
  const str = new TextDecoder("utf-8", { ignoreBOM: true }).decode(bytes);
  stringCache.set(file, str);
  return str;
}

for (const data of fixtures) {
  for (const encoding of data.encodings) {
    const originalString = await readText(data.original);
    const encodedBytes = await readBytes(data.encoded);
    expect(originalString.normalize("NFC")).toEqual(originalString);

    describe(`${data.encoded} as ${encoding}`, () => {
      it("decodes whole file", async () => {
        const decoder = charconv.createDecoder(encoding);
        const result = decoder.decode(encodedBytes);
        expect(result).toEqual(originalString);
      });

      // TODO: Testing small chunk sizes is very slow. Should make a `--slow`
      // test flag that will add more sizes here.
      for (const chunkSize of [1024]) {
        it(`decodes in chunks of ${chunkSize}`, () => {
          let source = encodedBytes;
          const decoder = charconv.createDecoder(encoding);
          let result = "";

          while (source.length > 0) {
            const chunk = source.subarray(0, chunkSize);
            source = source.subarray(chunkSize);
            result += decoder.decode(chunk, { stream: true });
          }

          result += decoder.decode();

          expect(result).toEqual(originalString);
        });
      }
    });
  }
}

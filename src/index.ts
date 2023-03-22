// SPDX-License-Identifier: MPL-2.0
// SPDX-FileCopyrightText: 2023 Lynn Kirby

import type { Decoder } from "./decoder.ts";
import { MultiByteDecoder } from "./multibyte-decoder.ts";
import { decodeUTF16, decodeUTF16BE, decodeUTF16LE } from "./utf-16.ts";

//=============================================================================
// Encoding information registry.

// TODO: Aliases and loose matching.

type EncodingInfo = {
  name: string;
  createDecoder: () => Decoder;
};

const aliasToInfo = new Map<string, EncodingInfo>();

[
  {
    name: "utf-16",
    createDecoder: () => new MultiByteDecoder(decodeUTF16),
  },
  {
    name: "utf-16le",
    createDecoder: () => new MultiByteDecoder(decodeUTF16LE),
  },
  {
    name: "utf-16be",
    createDecoder: () => new MultiByteDecoder(decodeUTF16BE),
  },
].forEach((encoding) => {
  aliasToInfo.set(encoding.name, encoding);
});

//=============================================================================
// Main exported API.

export function createDecoder(encoding: string): Decoder {
  encoding = String(encoding);
  const info = aliasToInfo.get(encoding);
  if (!info) {
    throw new Error(`The "${encoding}" encoding is not supported`);
  }
  return info.createDecoder();
}

export function decode(source: BufferSource, encoding: string): string {
  const decoder = createDecoder(encoding);
  return decoder.decode(source);
}

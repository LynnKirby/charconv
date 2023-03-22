// SPDX-License-Identifier: MPL-2.0
// SPDX-FileCopyrightText: 2023 Lynn Kirby

import { CharStr } from "./charcode.ts";
import { wrapBufferSource } from "./type-utils.ts";

export type DecoderDecodeOptions = {
  stream?: boolean | undefined;
};

/**
 * Incremental text decoder.
 */
export interface Decoder {
  decode(source?: BufferSource, options?: DecoderDecodeOptions): string;
  reset(): void;
}

/**
 * Base class for decoders.
 * @internal
 */
export abstract class AbstractDecoder implements Decoder {
  decode(source?: BufferSource, options?: DecoderDecodeOptions): string {
    const stream = Boolean(options?.stream);
    const array = source == null ? new Uint8Array() : wrapBufferSource(source);
    return this._decode(array, stream);
  }

  reset(): void {
    // Do nothing by default.
  }

  protected _error(): string {
    // TODO: Other error modes.
    return CharStr.Replacement;
  }

  protected abstract _decode(source: Uint8Array, stream: boolean): string;
}

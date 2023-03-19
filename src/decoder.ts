// SPDX-License-Identifier: MPL-2.0
// SPDX-FileCopyrightText: 2023 Lynn Kirby

import { CharStr } from "./charcode.ts";
import { wrapBufferSource } from "./type-utils.ts";

/**
 * Incremental text decoder.
 */
export interface Decoder {
  write(source: BufferSource): string;
  end(source?: BufferSource): string;
  reset(): void;
}

/**
 * Base class for decoders.
 * @internal
 */
export abstract class AbstractDecoder implements Decoder {
  write(source: BufferSource): string {
    return this._decode(wrapBufferSource(source), true);
  }

  end(source?: BufferSource): string {
    let array: Uint8Array;

    if (source == null) {
      array = new Uint8Array();
    } else {
      array = wrapBufferSource(source);
    }

    return this._decode(array, false);
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

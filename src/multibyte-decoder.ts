// SPDX-License-Identifier: MPL-2.0
// SPDX-FileCopyrightText: 2023 Lynn Kirby

import assert from "./assert.ts";
import { AbstractDecoder } from "./decoder.ts";

/**
 * Multi-byte decoder implementation.
 * @internal
 */
export type MultiByteDecodeFn = (
  source: Uint8Array,
  state: number,
) => MultiByteDecodeResult;

/** @internal */
export type MultiByteDecodeResult = {
  read: number;
  need: number;
  value: string;
  state: number;
  invalid: boolean;
};

const MAX_DECODER_BUFFER_LENGTH = 4;

/**
 * Base class for multi-byte decoders.
 * @internal
 */
export class MultiByteDecoder extends AbstractDecoder {
  private declare readonly _decodeFn: MultiByteDecodeFn;
  private declare _state: number;
  private declare _buffer: Uint8Array;
  private declare _bufferLength: number;
  private declare _bufferWantedLength: number;

  constructor(decodeFn: MultiByteDecodeFn) {
    super();
    this._decodeFn = decodeFn;
    this._state = 0;
    this._buffer = new Uint8Array(MAX_DECODER_BUFFER_LENGTH);
    this._bufferLength = 0;
    this._bufferWantedLength = 0;
  }

  _decode(source: Uint8Array, stream: boolean): string {
    let result = "";

    // Loop until the buffer is processed. This may occur more than once if
    // we encounter an error.
    while (this._bufferLength > 0) {
      // Shift data from source into buffer.
      let arrayPos = 0;
      while (
        arrayPos < source.length &&
        this._bufferLength < this._bufferWantedLength
      ) {
        this._buffer[this._bufferLength] = source[arrayPos]!;
        arrayPos++;
        this._bufferLength++;
      }
      source = source.subarray(arrayPos);

      // Exit function early if we didn't have enough data for the buffer.
      if (this._bufferLength < this._bufferWantedLength) {
        assert(source.length === 0);
        if (!stream) {
          for (let i = 0; i < this._bufferLength; i++) {
            result += this._error();
          }
          this.reset();
        }
        return result;
      }

      // Decode the buffer.
      const decoded = this._decodeFn(
        this._buffer.subarray(0, this._bufferLength),
        this._state,
      );
      result += decoded.value;
      this._state = decoded.state;
      this._bufferWantedLength = decoded.need;

      // Check if we read the entire buffer.
      if (decoded.read >= this._bufferLength) {
        assert(!decoded.invalid);
        assert(decoded.read === this._bufferLength);
        this._bufferLength = 0;
        this._bufferWantedLength = 0;
        break;
      }

      let newBufferStart = decoded.read;

      if (decoded.invalid) {
        result += this._error();
        newBufferStart++; // Skip invalid byte.
      }

      // Shift unused buffered data to beginning of the buffer.
      this._buffer.copyWithin(0, newBufferStart);
      this._bufferLength = this._bufferLength - newBufferStart;
      assert(this._bufferLength > 0);
    }

    assert(this._bufferLength === 0);

    // Process the main input.
    for (;;) {
      const decoded = this._decodeFn(source, this._state);

      result += decoded.value;
      this._state = decoded.state;
      this._bufferWantedLength = decoded.need;

      if (decoded.invalid) {
        result += this._error();
        source = source.subarray(decoded.read + 1); // Skip invalid byte.
      } else {
        source = source.subarray(decoded.read);
      }

      if (decoded.need > source.length) break;
    }

    // Handle undecoded trailing bytes.
    if (source.length > 0) {
      assert(source.length < MAX_DECODER_BUFFER_LENGTH);
      assert(source.length <= this._bufferWantedLength);

      if (stream) {
        // If streaming, append trailing bytes to the buffer.
        this._buffer.set(source);
        this._bufferLength = source.length;
        this._bufferWantedLength -= source.length;
        assert(this._bufferWantedLength >= 0);
      } else {
        // If not streaming, emit error for each trailing byte.
        for (let i = 0; i < source.length; i++) {
          result += this._error();
        }
      }
    }

    if (!stream) {
      this.reset();
    }

    return result;
  }

  override reset(): void {
    this._state = 0;
    this._bufferLength = 0;
    this._bufferWantedLength = 0;
  }
}

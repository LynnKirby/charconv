// SPDX-License-Identifier: MPL-2.0
// SPDX-FileCopyrightText: 2023 Lynn Kirby

// This module contains type checks and conversions that cannot be trivially
// performed.

// get ArrayBuffer.prototype.byteLength
// If `this` is an attached ArrayBuffer, returns the length.
// Otherwise throws.
const getArrayBufferPrototypeByteLength = Object.getOwnPropertyDescriptor(
  ArrayBuffer.prototype,
  "byteLength",
)!.get!;

// get SharedArrayBuffer.prototype.byteLength
// If `this` is an attached SharedArrayBuffer, returns the length.
// Otherwise throws.
const getSharedArrayBufferPrototypeByteLength =
  typeof SharedArrayBuffer !== "undefined"
    ? Object.getOwnPropertyDescriptor(SharedArrayBuffer.prototype, "byteLength")
        ?.get
    : undefined;

// get %TypedArray%.prototype[@@toStringTag]
// If `this` is a typed array, returns the typed array name.
// Otherwise returns undefined.
const getTypedArrayToStringTag = Object.getOwnPropertyDescriptor(
  Object.getPrototypeOf(Uint8Array).prototype,
  Symbol.toStringTag,
)!.get!;

/**
 * Returns true if the object is an unshared ArrayBuffer.
 * @internal
 */
export function isUnsharedArrayBuffer(obj: unknown): obj is ArrayBuffer {
  if (typeof obj !== "object" || obj === null) return false;
  try {
    getArrayBufferPrototypeByteLength.call(obj);
  } catch {
    return false;
  }
  return true;
}

/**
 * Returns true if the object is a SharedArrayBuffer.
 * @internal
 */
export function isSharedArrayBuffer(obj: unknown): obj is SharedArrayBuffer {
  if (!getArrayBufferPrototypeByteLength) return false;
  if (typeof obj !== "object" || obj === null) return false;
  try {
    getSharedArrayBufferPrototypeByteLength!.call(obj);
  } catch {
    return false;
  }
  return true;
}

/**
 * Wraps the given BufferSource into a new Uint8Array. Throws if the
 * BufferSource is invalid or detached.
 * @internal
 */
export function wrapBufferSource(
  source: BufferSource,
  argument: string = "source",
): Uint8Array {
  if (ArrayBuffer.isView(source)) {
    try {
      return new Uint8Array(
        source.buffer,
        source.byteOffset,
        source.byteLength,
      );
    } catch {
      throw new TypeError(`"${argument}" is a view on a detached ArrayBuffer`);
    }
  }

  if (isUnsharedArrayBuffer(source) || isSharedArrayBuffer(source)) {
    try {
      return new Uint8Array(source);
    } catch {
      throw new TypeError(`"${argument}" is a detached ArrayBuffer`);
    }
  }

  throw new TypeError(`"${argument}" is not an ArrayBuffer or a view on one`);
}

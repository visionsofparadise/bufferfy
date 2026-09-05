import { FALLBACK_MATCHER, type CodecMatcher } from "../../utilities/matcher";
import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { DecodeTransformStream } from "./DecodeTransform";
import { EncodeTransformStream } from "./EncodeTransform";

export type CodecType<T extends AbstractCodec> = T extends AbstractCodec<infer S> ? S : never;

const sharedWriter = new Writer();
let sharedWriterInUse = false;

export abstract class AbstractCodec<Value = unknown> {
	/**
	 * Returns true if the provided value is able to be encoded and decoded by this codec.
	 *
	 * @param	{Value} value - Value of this codec's type.
	 * @return	{boolean}
	 *
	 */
	abstract isValid(value: unknown): value is Value;

	/**
	 * Declares the broad-type match info a union uses to select this branch without a full isValid call.
	 *
	 * @return	{CodecMatcher}
	 *
	 */
	get matcher(): CodecMatcher {
		return FALLBACK_MATCHER;
	}

	/**
	 * Returns the expected byteLength of the buffer if this value was encoded.
	 *
	 * @param	{Value} value - Value of this codec's type.
	 * @return	{number} byteLength of buffer
	 *
	 */
	abstract byteLength(value: Value): number;

	/**
	 * Used internally to recursively encode.
	 *
	 * @param	{Value} value - Value of this codec's type.
	 * @param	{Writer} writer - Writer to encode into.
	 * @return	{void}
	 *
	 */
	abstract _encode(value: Value, writer: Writer): void;

	/**
	 * Encodes a value of this codecs type into a buffer.
	 *
	 * **Note:** This method does NOT validate the value before encoding.
	 * Call `isValid()` first if you need to verify the value is encodable.
	 * Encoding invalid values may result in undefined behavior or runtime errors.
	 *
	 * @param	{Value} value - Value of this codec's type.
	 * @param	{Uint8Array} [target] - A target buffer to write into (uses byteLength for sizing).
	 * @param	{number} [offset=0] - Offset at which to write into the target.
	 * @return	{Uint8Array} Buffer encoding of value.
	 *
	 */
	encode(value: Value, target?: Uint8Array, offset = 0): Uint8Array {
		if (target) {
			const buffer = offset ? new Uint8Array(target.buffer, target.byteOffset + offset) : target;
			const writer = new Writer(buffer);

			this._encode(value, writer);

			return writer.toBuffer();
		}

		if (sharedWriterInUse) {
			const writer = new Writer();

			this._encode(value, writer);

			return writer.toBuffer();
		}

		sharedWriterInUse = true;

		try {
			this._encode(value, sharedWriter);

			return sharedWriter.toBuffer().slice();
		} finally {
			sharedWriter.reset();
			sharedWriterInUse = false;
		}
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	Encoder(): TransformStream<Value, Uint8Array> {
		return new EncodeTransformStream(this);
	}

	/**
	 * Used internally to recursively decode
	 *
	 * @param	{Reader} reader - Reader to decode from.
	 * @return	{Value} Value decoded from the buffer
	 *
	 */
	abstract _decode(reader: Reader): Value;

	/**
	 * Decodes a buffer to a value of this codecs type.
	 *
	 * @param	{Uint8Array} buffer - The buffer to be decoded.
	 * @param	{number} [offset=0] - Offset at which to read at.
	 * @return	{Value} Value decoded from the buffer
	 *
	 */
	decode(source: Uint8Array, offset = 0): Value {
		const reader = new Reader(source, offset);

		return this._decode(reader);
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	Decoder(): TransformStream<Uint8Array, Value> {
		return new DecodeTransformStream(this);
	}
}

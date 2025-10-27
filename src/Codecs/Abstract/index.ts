import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { DecodeTransformStream } from "./DecodeTransform";
import { EncodeTransformStream } from "./EncodeTransform";

export type CodecType<T extends AbstractCodec<any>> = T extends AbstractCodec<infer S> ? S : never;

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
	encode(value: Value, target?: Uint8Array, offset: number = 0): Uint8Array {
		let buffer: Uint8Array | undefined;

		if (target) {
			buffer = offset ? new Uint8Array(target.buffer, target.byteOffset + offset) : target;
		}

		const writer = new Writer(buffer);

		this._encode(value, writer);

		return writer.toBuffer();
	}

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
	decode(source: Uint8Array, offset: number = 0): Value {
		const reader = new Reader(source, offset);

		return this._decode(reader);
	}

	Decoder(): TransformStream<Uint8Array, Value> {
		return new DecodeTransformStream(this);
	}
}

import { TransformStream } from "stream/web";
import { Context } from "../../utilities/Context";
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
	 * @param	{Uint8Array} buffer - Buffer being written into.
	 * @param	{Context} c - Context for the current encode chain.
	 * @return	{void}
	 *
	 */
	abstract _encode(value: Value, buffer: Uint8Array, c: Context): void;

	/**
	 * Encodes a value of this codecs type into a buffer.
	 *
	 * @param	{Value} value - Value of this codec's type.
	 * @param	{Uint8Array} [target] - A target buffer to write into.
	 * @param	{number} [offset=0] - Offset at which to write into the target.
	 * @return	{Uint8Array} Buffer encoding of value.
	 *
	 */
	encode(value: Value, target?: Uint8Array, offset: number = 0): Uint8Array {
		const c = new Context();

		const byteLength = this.byteLength(value);

		if (target) {
			const buffer = offset ? new Uint8Array(target.buffer, target.byteOffset + offset, byteLength) : target;

			this._encode(value, buffer, c);

			return buffer;
		}

		const buffer = new Uint8Array(new ArrayBuffer(byteLength), 0, byteLength);

		this._encode(value, buffer, c);

		return buffer;
	}

	Encoder(): TransformStream<Value, Uint8Array> {
		return new EncodeTransformStream(this);
	}

	/**
	 * Used internally to recursively decode
	 *
	 * @param	{Uint8Array} buffer - The buffer to be decoded.
	 * @param	{Context} c - Context for the current decode chain
	 * @return	{Value} Value decoded from the buffer
	 *
	 */
	abstract _decode(buffer: Uint8Array, c: Context): Value;

	/**
	 * Decodes a buffer to a value of this codecs type.
	 *
	 * @param	{Uint8Array} buffer - The buffer to be decoded.
	 * @param	{number} [offset=0] - Offset at which to read at.
	 * @return	{Value} Value decoded from the buffer
	 *
	 */
	decode(source: Uint8Array, offset: number = 0): Value {
		const c = new Context();

		const buffer = new Uint8Array(source.buffer, source.byteOffset + offset, source.byteLength - offset);

		return this._decode(buffer, c);
	}

	Decoder(): TransformStream<Uint8Array, Value> {
		return new DecodeTransformStream(this);
	}
}

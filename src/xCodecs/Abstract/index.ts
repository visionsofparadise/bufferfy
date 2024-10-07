import { Transform, TransformOptions } from "stream";
import { Context } from "../../utilities/Context";
import { DecodeTransform } from "./DecodeTransform";
import { EncodeTransform } from "./EncodeTransform";

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
	 * @param	{Buffer} buffer - Buffer being written into.
	 * @param	{Context} c - Context for the current encode chain.
	 * @return	{void}
	 *
	 */
	abstract _encode(value: Value, buffer: Buffer, c: Context): void;

	/**
	 * Used internally to recursively encode via a transform stream.
	 *
	 * @param	{Value} value - Value of this codec's type.
	 * @param	{EncodeTransform} transform - The transform that is being worked on.
	 * @return	{Promise<void>}
	 *
	 */
	async _encodeChunks(value: Value, transform: EncodeTransform): Promise<void> {
		await transform.pushAsync(this.encode(value));
	}

	/**
	 * Encodes a value of this codecs type into a buffer.
	 *
	 * @param	{Value} value - Value of this codec's type.
	 * @return	{Buffer} Buffer encoding of value.
	 *
	 */
	encode(value: Value, target?: Buffer, offset: number = 0): Buffer {
		const c = new Context();

		c.offset = offset;

		const byteLength = this.byteLength(value);

		const buffer = target || Buffer.allocUnsafe(byteLength);

		this._encode(value, buffer, c);

		return buffer;
	}

	Encoder(options?: TransformOptions): Transform {
		return new EncodeTransform(this, options);
	}

	/**
	 * Used internally to recursively decode
	 *
	 * @param	{Buffer} buffer - The buffer to be decoded.
	 * @param	{Context} c - Context for the current decode chain
	 * @return	{Value} Value decoded from the buffer
	 *
	 */
	abstract _decode(buffer: Buffer, c: Context): Value;

	/**
	 * Used internally to recursively decode via a transform stream.
	 *
	 * @param	{DecodeTransform} transform - The transform that is being worked on.
	 * @return	{Promise<Value>} Value of this codec's type.
	 *
	 */
	abstract _decodeChunks(transform: DecodeTransform): Promise<Value>;

	/**
	 * Decodes a buffer to a value of this codecs type.
	 *
	 * @param	{Buffer} buffer - The buffer to be decoded.
	 * @return	{Value} Value decoded from the buffer
	 *
	 */
	decode(buffer: Buffer, offset: number = 0): Value {
		const c = new Context();

		c.offset = offset;

		return this._decode(buffer, c);
	}

	Decoder(options?: TransformOptions): Transform {
		return new DecodeTransform(this, options);
	}
}

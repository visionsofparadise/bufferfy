import { Context } from "../../utilities/Context";
import { Stream } from "../../utilities/Stream";

export type CodecType<T extends AbstractCodec<any>> = T extends AbstractCodec<infer S> ? S : never;

export abstract class AbstractCodec<Value = any> {
	protected _id?: string;

	constructor() {}

	/**
	 * Returns true if the provided value is able to be encoded and decoded by this codec.
	 *
	 * @param	{Value} value - Value of this codec's type.
	 * @param	{Context} [context] - Upstream codecs and values.
	 * @return	{boolean}
	 *
	 */
	abstract match(value: any, context?: Context): value is Value;

	/**
	 * Returns the expected byteLength of the buffer if this value was encoded.
	 *
	 * @param	{Value} value - Value of this codec's type.
	 * @param	{Context} [context] - Upstream codecs and values.
	 * @return	{number} byteLength of buffer
	 *
	 */
	abstract encodingLength(value: Value, context?: Context): number;

	/**
	 * Encodes a value into the write stream.
	 *
	 * @param	{Value} value - Value of this codec's type.
	 * @param	{Stream} stream - Stream containing a buffer and current position.
	 * @param	{Context} [context] - Upstream codecs and values.
	 * @return	{void}
	 *
	 */
	abstract write(value: Value, stream: Stream, context?: Context): void;

	/**
	 * Decodes a value from a read stream.
	 *
	 * @param	{Stream} stream - Stream containing a buffer and current position.
	 * @param	{Context} [context] - Upstream codecs and values.
	 * @return	{Value} The value that was read.
	 *
	 */
	abstract read(stream: Stream, context?: Context): Value;

	/**
	 * Encodes a value of this codecs type into a buffer.
	 *
	 * @param	{Value} value - Value of this codec's type.
	 * @param	{Buffer} [buffer] - An existing buffer to write to, otherwise a new buffer is created.
	 * @param	{number} [offset] - Write to the provided buffer starting at this byte index.
	 * @return	{Buffer} Buffer encoding of value
	 *
	 */
	encode(value: Value, buffer?: Buffer, offset?: number): Buffer {
		const context = new Context();

		const size = this.encodingLength(value, context);

		const streamBuffer = buffer?.subarray(offset) || Buffer.allocUnsafe(size);

		const stream = new Stream(streamBuffer);

		this.write(value, stream, context);

		return buffer || stream.buffer;
	}

	/**
	 * Decodes a buffer to a value of this codecs type.
	 *
	 * @param	{Buffer} buffer - An existing buffer to write to, otherwise a new buffer is created.
	 * @param	{number} [start] - Read from the provided buffer starting at this byte index.
	 * @param	{number} [end] - Read up to but not including this byte index.
	 * @return	{Value} Value decoded from the buffer
	 *
	 */
	decode(buffer: Buffer, start?: number, end?: number): Value {
		const context = new Context();

		const stream = new Stream(buffer.subarray(start, end));

		return this.read(stream, context);
	}

	/**
	 * Sets the current value and codec in the current context
	 *
	 * @param	{Value} value - Value of this codec's type.
	 * @param	{Context} [context] - Upstream codecs and values.
	 * @return	{void}
	 *
	 */
	setContext(value: Value, context: Context): void {
		if (this._id) {
			context.codecs[this._id] = this;
			context.values[this._id] = value;
		}
	}
}

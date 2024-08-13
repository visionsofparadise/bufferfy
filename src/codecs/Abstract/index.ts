import { WebSafeBuffer } from "../../utilities/Buffer";
import { Context } from "../../utilities/Context";
import { Stream } from "../../utilities/Stream";

export type CodecType<T extends AbstractCodec<any>> = T extends AbstractCodec<infer S> ? S : never;

export abstract class AbstractCodec<Value = any> {
	protected _id?: string;

	constructor() {}

	abstract match(value: any, context: Context): value is Value;
	abstract encodingLength(value: Value, context: Context): number;
	abstract write(value: Value, stream: Stream, context: Context): void;
	abstract read(stream: Stream, context: Context): Value;

	encode(value: Value, buffer?: Buffer, offset?: number): Buffer {
		const context = new Context();

		const size = this.encodingLength(value, context);

		const streamBuffer = buffer?.subarray(offset) || WebSafeBuffer.allocUnsafe(size);

		const stream = new Stream(streamBuffer);

		this.write(value, stream, context);

		return buffer || stream.buffer;
	}

	decode(buffer: Buffer, start?: number, end?: number): Value {
		const context = new Context();

		const stream = new Stream(buffer.subarray(start, end));

		return this.read(stream, context);
	}

	setContext(value: Value, context: Context): void {
		if (this._id) {
			context.codecs[this._id] = this;
			context.values[this._id] = value;
		}
	}
}

import { Context } from "../../utilities/Context";
import { LengthOptions } from "../../utilities/Length";
import { PointableOptions } from "../../utilities/Pointable";
import { Stream } from "../../utilities/Stream";
import { AbstractCodec } from "../Abstract";
import { UIntCodec } from "../UInt";
import { VarUIntCodec } from "../VarUInt";

export interface AnyCodecOptions<Value extends any> extends Pick<LengthOptions, "lengthCodec">, PointableOptions {
	encode?: (value: Value) => Buffer;
	decode?: (buffer: Buffer) => Value;
}

export class AnyCodec<Value extends any = any> extends AbstractCodec<Value> {
	private readonly _encode: (value: Value) => Buffer;
	private readonly _decode: (buffer: Buffer) => Value;
	private readonly _lengthCodec: UIntCodec | VarUIntCodec;

	constructor(options?: AnyCodecOptions<Value>) {
		super();

		this._encode = options?.encode || ((value: Value) => Buffer.from(JSON.stringify(value)));
		this._decode = options?.decode || ((buffer: Buffer) => JSON.parse(buffer.toString()));
		this._lengthCodec = options?.lengthCodec || new VarUIntCodec();
	}

	match(value: any, context: Context): value is Value {
		this.setContext(value, context);

		return true;
	}

	encodingLength(value: Value, context: Context = new Context()): number {
		this.setContext(value, context);

		let length = this._encode(value).byteLength;

		return this._lengthCodec.encodingLength(length, context) + length;
	}

	write(value: Value, stream: Stream, context: Context): void {
		this.setContext(value, context);

		const buffer = this._encode(value);

		this._lengthCodec.write(buffer.byteLength, stream, context);

		stream.position += buffer.copy(stream.buffer, stream.position);
	}

	read(stream: Stream, context: Context): Value {
		const length = this._lengthCodec.read(stream, context);

		const value = this._decode(stream.buffer.subarray(stream.position, (stream.position += length)));

		this.setContext(value, context);

		return value;
	}
}

export function createAnyCodec<Value extends any = any>(...parameters: ConstructorParameters<typeof AnyCodec<Value>>) {
	return new AnyCodec<Value>(...parameters);
}

import { Context } from "../../utilities/Context";
import { BufferfyByteLengthError } from "../../utilities/Error";
import { AbstractCodec } from "../Abstract";
import { VarInt60Codec } from "../VarInt/VarInt60";

export interface AnyCodecOptions<Value = any> {
	encode?: (value: Value) => Buffer;
	decode?: (buffer: Buffer) => Value;
	lengthCodec?: AbstractCodec<number>;
}

/**
 * Creates a codec for any or custom values. By default uses JSON.stringify and JSON.parse.
 *
 * Serializes to ```[LENGTH][VALUE]```
 *
 * @param	{AnyCodecOptions} [options]
 * @param	{(value) => Buffer} [options.encode] - Sets a custom encoder.
 * @param	{(buffer) => Value} [options.decode] - Sets a custom decoder.
 * @param	{AbstractCodec<number>} [options.lengthCodec="VarInt50()"] - Codec to specify how the length is encoded.
 * @return	{AnyCodec} AnyCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Any/index.ts|Source}
 */
export const createAnyCodec = <Value = any>(options?: AnyCodecOptions<Value>) => new AnyCodec(options);

export class AnyCodec<Value = any> extends AbstractCodec<Value> {
	private readonly _encodeValue: (value: Value) => Buffer;
	private readonly _decodeValue: (buffer: Buffer) => Value;

	readonly lengthCodec: AbstractCodec<number>;

	constructor(options?: AnyCodecOptions<Value>) {
		super();

		this._encodeValue = options?.encode || ((value: Value) => Buffer.from(JSON.stringify(value)));
		this._decodeValue = options?.decode || ((buffer: Buffer) => JSON.parse(buffer.toString()));
		this.lengthCodec = options?.lengthCodec || new VarInt60Codec();
	}

	isValid(_value: unknown): _value is any {
		return true;
	}

	byteLength(value: Value): number {
		let byteLength = this._encodeValue(value).byteLength;

		return this.lengthCodec.byteLength(byteLength) + byteLength;
	}

	_encode(value: Value, buffer: Buffer, c: Context): void {
		const valueBuffer = this._encodeValue(value);

		this.lengthCodec._encode(valueBuffer.byteLength, buffer, c);

		c.offset += valueBuffer.copy(buffer, c.offset, 0, valueBuffer.byteLength);
	}

	_decode(buffer: Buffer, c: Context): Value {
		const byteLength = this.lengthCodec._decode(buffer, c);

		if (buffer.byteLength < c.offset + byteLength) throw new BufferfyByteLengthError();

		const valueBuffer = buffer.subarray(c.offset, (c.offset += byteLength));

		return this._decodeValue(valueBuffer);
	}
}

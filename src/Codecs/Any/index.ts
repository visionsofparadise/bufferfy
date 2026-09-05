import { AbstractCodec } from "../Abstract";
import { BytesVariableCodec } from "../Bytes/Variable";
import { VarInt60Codec } from "../VarInt/VarInt60";
import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";

export interface AnyCodecOptions<Value = unknown> {
	encode?: (value: Value) => Uint8Array;
	decode?: (buffer: Uint8Array) => Value;
	lengthCodec?: AbstractCodec<number>;
}

/**
 * Creates a codec for any or custom values. By default uses JSON.stringify and JSON.parse.
 *
 * Serializes to ```[LENGTH][VALUE]```
 *
 * @param	{AnyCodecOptions} [options]
 * @param	{(value) => Uint8Array} [options.encode] - Sets a custom encoder.
 * @param	{(buffer) => Value} [options.decode] - Sets a custom decoder.
 * @param	{AbstractCodec<number>} [options.lengthCodec="VarInt50()"] - Codec to specify how the length is encoded.
 * @return	{AnyCodec} AnyCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Any/index.ts|Source}
 */
export const createAnyCodec = <Value = unknown>(options?: AnyCodecOptions<Value>) => new AnyCodec(options);

export class AnyCodec<Value = unknown> extends AbstractCodec<Value> {
	private readonly _encodeValue: (value: Value) => Uint8Array;
	private readonly _decodeValue: (buffer: Uint8Array) => Value;

	readonly lengthCodec: AbstractCodec<number>;
	private readonly _bytesCodec: BytesVariableCodec;

	constructor(options?: AnyCodecOptions<Value>) {
		super();

		this._encodeValue = options?.encode ?? ((value: Value) => new TextEncoder().encode(JSON.stringify(value)));
		this._decodeValue =
			options?.decode ?? ((buffer: Uint8Array) => JSON.parse(new TextDecoder().decode(buffer)) as Value);
		this.lengthCodec = options?.lengthCodec ?? new VarInt60Codec();
		this._bytesCodec = new BytesVariableCodec(this.lengthCodec);
	}

	isValid(_value: unknown): _value is Value {
		return true;
	}

	byteLength(value: Value): number {
		const byteLength = this._encodeValue(value).byteLength;

		return this.lengthCodec.byteLength(byteLength) + byteLength;
	}

	_encode(value: Value, writer: Writer): void {
		const valueBuffer = this._encodeValue(value);

		this._bytesCodec._encode(valueBuffer, writer);
	}

	_decode(reader: Reader): Value {
		const valueBuffer = this._bytesCodec._decode(reader);

		return this._decodeValue(valueBuffer);
	}
}

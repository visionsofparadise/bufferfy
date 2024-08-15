import { Context } from "../../utilities/Context";
import { BufferfyError } from "../../utilities/Error";
import { PointableOptions } from "../../utilities/Pointable";
import { Stream } from "../../utilities/Stream";
import { AbstractCodec, CodecType } from "../Abstract";

export interface SwitchCodecOptions<CodecMap extends Record<PropertyKey, AbstractCodec<any>>> extends PointableOptions {
	getValueCase: (value: CodecType<CodecMap[keyof CodecMap]>) => PropertyKey;
	getBufferCase: (buffer: Buffer) => PropertyKey;
	default?: keyof CodecMap;
}

export class SwitchCodec<CodecMap extends Record<PropertyKey, AbstractCodec<any>>> extends AbstractCodec<CodecType<CodecMap[keyof CodecMap]>> {
	private readonly _codecMap: CodecMap;
	private readonly _getValueCase: (value: CodecType<CodecMap[keyof CodecMap]>) => PropertyKey;
	private readonly _getBufferCase: (buffer: Buffer) => PropertyKey;
	private readonly _default?: keyof CodecMap;

	constructor(codecMap: CodecMap, options: SwitchCodecOptions<CodecMap>) {
		super();

		this._id = options.id;
		this._codecMap = codecMap;
		this._getValueCase = options.getValueCase;
		this._getBufferCase = options.getBufferCase;
		this._default = options.default;
	}

	getDefaultCodec(): CodecMap[keyof CodecMap] | undefined {
		if (!this._default) return undefined;

		return this._codecMap[this._default];
	}

	match(value: any, context: Context): value is CodecType<CodecMap[keyof CodecMap]> {
		try {
			const codec = this._codecMap[this._getValueCase(value)] || this.getDefaultCodec();

			if (!codec) return false;
			if (!codec.match(value, context)) return false;

			this.setContext(value, context);

			return true;
		} catch (error) {
			return false;
		}
	}

	encodingLength(value: CodecType<CodecMap[keyof CodecMap]>, context: Context = new Context()): number {
		this.setContext(value, context);

		const codec = this._codecMap[this._getValueCase(value)] || this.getDefaultCodec();

		if (!codec) throw new BufferfyError("Value does not match any codec");

		return codec.encodingLength(value, context);
	}

	write(value: CodecType<CodecMap[keyof CodecMap]>, stream: Stream, context: Context): void {
		this.setContext(value, context);

		const codec = this._codecMap[this._getValueCase(value)] || this.getDefaultCodec();

		if (!codec) throw new BufferfyError("Value does not match any codec");

		codec.write(value, stream, context);
	}

	read(stream: Stream, context: Context): CodecType<CodecMap[keyof CodecMap]> {
		const codec = this._codecMap[this._getBufferCase(stream.buffer.subarray(stream.position))] || this.getDefaultCodec();

		if (!codec) throw new BufferfyError("Buffer does not match any codec");

		const value = codec.read(stream, context);

		this.setContext(value, context);

		return value;
	}
}

export function createSwitchCodec<CodecMap extends Record<PropertyKey, AbstractCodec<any>>>(...parameters: ConstructorParameters<typeof SwitchCodec<CodecMap>>) {
	return new SwitchCodec<CodecMap>(...parameters);
}

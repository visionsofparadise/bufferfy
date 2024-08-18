import { endianness as osEndianness } from "os";
import { Context } from "../../utilities/Context";
import { BufferfyError } from "../../utilities/Error";
import { PointableOptions } from "../../utilities/Pointable";
import { Stream } from "../../utilities/Stream";
import { AbstractCodec } from "../Abstract";
import { Endianness } from "../UInt";

export type FloatBits = 32 | 64;

export const FLOAT_BIT_BYTE_MAP = {
	32: 4 as const,
	64: 8 as const,
};

export interface FloatCodecOptions extends PointableOptions {}

export class FloatCodec extends AbstractCodec<number> {
	public readonly byteLength: number;
	private readonly _isLittleEndian: boolean;

	constructor(public readonly bits: FloatBits = 32, public readonly endianness: Endianness = osEndianness(), options?: FloatCodecOptions) {
		super();

		this._id = options?.id;
		this.byteLength = FLOAT_BIT_BYTE_MAP[bits];

		if (!this.byteLength) throw new BufferfyError("Invalid integer bits");

		this._isLittleEndian = endianness === "LE";
	}

	match(value: any, context: Context = new Context()): value is number {
		const isMatch = typeof value === "number";

		if (isMatch) this.setContext(value, context);

		return isMatch;
	}

	encodingLength(value: number, context: Context = new Context()): number {
		this.setContext(value, context);

		return this.byteLength;
	}

	write(value: number, stream: Stream, context: Context = new Context()): void {
		this.setContext(value, context);

		stream.view[`setFloat${this.bits}`](stream.position, value, this._isLittleEndian);

		stream.position += this.byteLength;
	}

	read(stream: Stream, context: Context = new Context()): number {
		const value = stream.view[`getFloat${this.bits}`](stream.position, this._isLittleEndian);

		stream.position += this.byteLength;

		this.setContext(value, context);

		return value;
	}
}

export function createFloatCodec(...parameters: ConstructorParameters<typeof FloatCodec>): FloatCodec {
	return new FloatCodec(...parameters);
}

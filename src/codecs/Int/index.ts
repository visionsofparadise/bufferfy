import { endianness as osEndianness } from "os";
import { Context } from "../../utilities/Context";
import { BufferfyError } from "../../utilities/Error";
import { PointableOptions } from "../../utilities/Pointable";
import { Stream } from "../../utilities/Stream";
import { AbstractCodec } from "../Abstract";
import { BIT_BYTE_MAP, Endianness, IntegerBits } from "../UInt";

export interface IntCodecOptions extends PointableOptions {}

export class IntCodec extends AbstractCodec<number> {
	public readonly byteLength: number;

	constructor(public readonly bits: IntegerBits = 48, public readonly endianness: Endianness = osEndianness(), options?: IntCodecOptions) {
		super();

		this._id = options?.id;
		this.byteLength = BIT_BYTE_MAP[bits];

		if (!this.byteLength) throw new BufferfyError("Invalid integer bits");

		if (this.bits === 8 || this.bits === 16 || this.bits === 32) {
			const isLittleEndian = this.endianness === "LE";

			const setterKey = `setInt${this.bits}` as const;

			this.write = (value: number, stream: Stream, context: Context): void => {
				this.setContext(value, context);

				stream.view[setterKey](stream.position, value, isLittleEndian);

				stream.position += this.byteLength;
			};

			const getterKey = `getInt${this.bits}` as const;

			this.read = (stream: Stream, context: Context): number => {
				const value = stream.view[getterKey](stream.position, isLittleEndian);

				stream.position += this.byteLength;

				this.setContext(value, context);

				return value;
			};

			return;
		}

		this.write = (value: number, stream: Stream, context: Context): void => {
			this.setContext(value, context);

			stream.position = stream.buffer[`writeInt${this.endianness}`](value, stream.position, this.byteLength);
		};

		this.read = (stream: Stream, context: Context): number => {
			const value = stream.buffer[`readInt${this.endianness}`](stream.position, this.byteLength);

			stream.position += this.byteLength;

			this.setContext(value, context);

			return value;
		};
	}

	match(value: any, context: Context): value is number {
		const isMatch = typeof value === "number" && Number.isSafeInteger(value);

		if (isMatch) this.setContext(value, context);

		return isMatch;
	}

	encodingLength(value: number, context: Context): number {
		this.setContext(value, context);

		return this.byteLength;
	}

	write: (value: number, stream: Stream, context: Context) => void;
	read: (stream: Stream, context: Context) => number;
}

export const createIntCodec = (...parameters: ConstructorParameters<typeof IntCodec>) => {
	return new IntCodec(...parameters);
};

import { endianness as osEndianness } from "os";
import { Context } from "../../utilities/Context";
import { BufferfyError } from "../../utilities/Error";
import { PointableOptions } from "../../utilities/Pointable";
import { Stream } from "../../utilities/Stream";
import { AbstractCodec } from "../Abstract";

export type IntegerBits = 8 | 16 | 24 | 32 | 40 | 48;

export type Endianness = "BE" | "LE";

export const BIT_BYTE_MAP = {
	8: 1 as const,
	16: 2 as const,
	24: 3 as const,
	32: 4 as const,
	40: 5 as const,
	48: 6 as const,
};

export interface UIntCodecOptions extends PointableOptions {}

export class UIntCodec<Value extends number = number> extends AbstractCodec<Value> {
	public readonly byteLength: number;

	constructor(public readonly bits: IntegerBits = 48, public readonly endianness: Endianness = osEndianness(), options?: UIntCodecOptions) {
		super();

		this._id = options?.id;
		this.byteLength = BIT_BYTE_MAP[bits];

		if (!this.byteLength) throw new BufferfyError("Invalid integer bits");

		if (this.bits === 8) {
			this.write = (value: Value, stream: Stream, context: Context): void => {
				this.setContext(value, context);

				stream.buffer[stream.position++] = value;
			};

			this.read = (stream: Stream, context: Context): Value => {
				const value = stream.buffer[stream.position++] as Value;

				this.setContext(value, context);

				return value;
			};

			return;
		}

		if (this.bits === 16) {
			this.write = (value: Value, stream: Stream, context: Context): void => {
				this.setContext(value, context);

				stream.buffer[stream.position++] = value >>> 8;
				stream.buffer[stream.position++] = value & 0xff;
			};

			this.read = (stream: Stream, context: Context): Value => {
				const value = ((stream.buffer[stream.position++] << 8) + stream.buffer[stream.position++]) as Value;

				this.setContext(value, context);

				return value;
			};

			return;
		}

		if (this.bits === 32) {
			const isLittleEndian = this.endianness === "LE";

			this.write = (value: Value, stream: Stream, context: Context): void => {
				this.setContext(value, context);

				stream.view.setUint32(stream.position, value, isLittleEndian);

				stream.position += this.byteLength;
			};

			this.read = (stream: Stream, context: Context): Value => {
				const value = stream.view.getUint32(stream.position, isLittleEndian) as Value;

				stream.position += this.byteLength;

				this.setContext(value, context);

				return value;
			};

			return;
		}

		this.write = (value: Value, stream: Stream, context: Context): void => {
			this.setContext(value, context);

			stream.position = stream.buffer[`writeUInt${this.endianness}`](value, stream.position, this.byteLength);
		};

		this.read = (stream: Stream, context: Context): Value => {
			const value = stream.buffer[`readUInt${this.endianness}`](stream.position, this.byteLength) as Value;

			stream.position += this.byteLength;

			this.setContext(value, context);

			return value;
		};
	}

	match(value: any, context: Context): value is Value {
		const isMatch = typeof value === "number" && Number.isInteger(value) && value >= 0 && value < Number.MAX_SAFE_INTEGER;

		if (isMatch) this.setContext(value as Value, context);

		return isMatch;
	}

	encodingLength(value: Value, context: Context): number {
		this.setContext(value, context);

		return this.byteLength;
	}

	write: (value: Value, stream: Stream, context: Context) => void;
	read: (stream: Stream, context: Context) => Value;
}

export function createUIntCodec<Value extends number = number>(...parameters: ConstructorParameters<typeof UIntCodec<Value>>) {
	return new UIntCodec<Value>(...parameters);
}

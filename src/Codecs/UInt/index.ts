import { BufferfyRangeError } from "../../utilities/Error";
import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { type ByteOrderStrategy, BE_STRATEGY, LE_STRATEGY } from "./ByteOrderStrategy.js";

export const endiannessValues = ["BE", "LE"] as const;

export type Endianness = (typeof endiannessValues)[number];

export const uIntBitValues = [8, 16, 24, 32, 40, 48] as const;

export type UIntBits = (typeof uIntBitValues)[number];

export const UINT_BIT_BYTE_MAP = {
	8: 1,
	16: 2,
	24: 3,
	32: 4,
	40: 5,
	48: 6,
} as const;

export type ValidationMode = "both" | "encode" | "decode" | "none";

export interface UIntCodecOptions {
	minimum?: number;
	maximum?: number;
	validationMode?: ValidationMode;
}

export type UIntCodec = UInt8Codec | UInt16Codec | UInt24Codec | UInt32Codec | UInt40Codec | UInt48Codec;

/**
 * Creates a codec for a unsigned integer.
 *
 * Serializes to ```[UINT]```
 *
 * @param	{8 | 16 | 24 | 32 | 40 | 48} [bits=48] - Bit type of integer.
 * @param	{'LE' | 'BE'} [endianness='BE'] - Endianness
 * @param	{UIntCodecOptions} [options] - Validation options (minimum, maximum)
 * @return	{UIntCodec} UIntCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/UInt/index.ts|Source}
 */
export const createUIntCodec = (bits: UIntBits = 48, endianness: Endianness = "BE", options?: UIntCodecOptions): UIntCodec => {
	const byteOrderStrategy = endianness === "BE" ? BE_STRATEGY : LE_STRATEGY;

	switch (bits) {
		case 8:
			return new UInt8Codec(options);
		case 16:
			return new UInt16Codec(byteOrderStrategy, options);
		case 24:
			return new UInt24Codec(byteOrderStrategy, options);
		case 32:
			return new UInt32Codec(byteOrderStrategy, options);
		case 40:
			return new UInt40Codec(byteOrderStrategy, options);
		case 48:
			return new UInt48Codec(byteOrderStrategy, options);
	}
};

export class UInt8Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 1;

	constructor(private readonly options?: UIntCodecOptions) {
		super();
	}

	isValid(value: unknown): value is number {
		if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value >= 256) return false;

		if (this.options?.minimum !== undefined && value < this.options.minimum) return false;
		if (this.options?.maximum !== undefined && value > this.options.maximum) return false;

		return true;
	}

	byteLength(): 1 {
		return UInt8Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "encode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} is less than minimum ${this.options.minimum}`,
				"UInt8Codec",
				value,
				this.options.minimum
			);
		}

		if ((validationMode === "both" || validationMode === "encode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} exceeds maximum ${this.options.maximum}`,
				"UInt8Codec",
				value,
				this.options.maximum
			);
		}

		writer.writeByte(value);
	}

	_decode(reader: Reader): number {
		const value = reader.readByte();
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "decode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} is less than minimum ${this.options.minimum}`,
				"UInt8Codec",
				value,
				this.options.minimum,
				reader.position
			);
		}

		if ((validationMode === "both" || validationMode === "decode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} exceeds maximum ${this.options.maximum}`,
				"UInt8Codec",
				value,
				this.options.maximum,
				reader.position
			);
		}

		return value;
	}
}

export class UInt16Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 2;

	constructor(private readonly byteOrderStrategy: ByteOrderStrategy, private readonly options?: UIntCodecOptions) {
		super();
	}

	isValid(value: unknown): value is number {
		if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value >= 65536) return false;

		if (this.options?.minimum !== undefined && value < this.options.minimum) return false;
		if (this.options?.maximum !== undefined && value > this.options.maximum) return false;

		return true;
	}

	byteLength(): 2 {
		return UInt16Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "encode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} is less than minimum ${this.options.minimum}`,
				"UInt16Codec",
				value,
				this.options.minimum
			);
		}

		if ((validationMode === "both" || validationMode === "encode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} exceeds maximum ${this.options.maximum}`,
				"UInt16Codec",
				value,
				this.options.maximum
			);
		}

		this.byteOrderStrategy.write(writer, UInt16Codec.BYTE_LENGTH, (index) => (value >>> ((1 - index) * 8)) & 0xff);
	}

	_decode(reader: Reader): number {
		const bytes = this.byteOrderStrategy.read(reader, UInt16Codec.BYTE_LENGTH);
		const value = (bytes[0] << 8) | bytes[1];
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "decode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} is less than minimum ${this.options.minimum}`,
				"UInt16Codec",
				value,
				this.options.minimum,
				reader.position
			);
		}

		if ((validationMode === "both" || validationMode === "decode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} exceeds maximum ${this.options.maximum}`,
				"UInt16Codec",
				value,
				this.options.maximum,
				reader.position
			);
		}

		return value;
	}
}

export class UInt24Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 3;

	constructor(private readonly byteOrderStrategy: ByteOrderStrategy, private readonly options?: UIntCodecOptions) {
		super();
	}

	isValid(value: unknown): value is number {
		if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value >= 16777216) return false;

		if (this.options?.minimum !== undefined && value < this.options.minimum) return false;
		if (this.options?.maximum !== undefined && value > this.options.maximum) return false;

		return true;
	}

	byteLength(): 3 {
		return UInt24Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "encode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} is less than minimum ${this.options.minimum}`,
				"UInt24Codec",
				value,
				this.options.minimum
			);
		}

		if ((validationMode === "both" || validationMode === "encode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} exceeds maximum ${this.options.maximum}`,
				"UInt24Codec",
				value,
				this.options.maximum
			);
		}

		this.byteOrderStrategy.write(writer, UInt24Codec.BYTE_LENGTH, (index) => (value >>> ((2 - index) * 8)) & 0xff);
	}

	_decode(reader: Reader): number {
		const bytes = this.byteOrderStrategy.read(reader, UInt24Codec.BYTE_LENGTH);
		const value = (bytes[0] << 16) | (bytes[1] << 8) | bytes[2];
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "decode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} is less than minimum ${this.options.minimum}`,
				"UInt24Codec",
				value,
				this.options.minimum,
				reader.position
			);
		}

		if ((validationMode === "both" || validationMode === "decode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} exceeds maximum ${this.options.maximum}`,
				"UInt24Codec",
				value,
				this.options.maximum,
				reader.position
			);
		}

		return value;
	}
}

export class UInt32Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 4;

	constructor(private readonly byteOrderStrategy: ByteOrderStrategy, private readonly options?: UIntCodecOptions) {
		super();
	}

	isValid(value: unknown): value is number {
		if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value >= 4294967296) return false;

		if (this.options?.minimum !== undefined && value < this.options.minimum) return false;
		if (this.options?.maximum !== undefined && value > this.options.maximum) return false;

		return true;
	}

	byteLength(): 4 {
		return UInt32Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "encode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} is less than minimum ${this.options.minimum}`,
				"UInt32Codec",
				value,
				this.options.minimum
			);
		}

		if ((validationMode === "both" || validationMode === "encode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} exceeds maximum ${this.options.maximum}`,
				"UInt32Codec",
				value,
				this.options.maximum
			);
		}

		this.byteOrderStrategy.write(writer, UInt32Codec.BYTE_LENGTH, (index) => (value >>> ((3 - index) * 8)) & 0xff);
	}

	_decode(reader: Reader): number {
		const bytes = this.byteOrderStrategy.read(reader, UInt32Codec.BYTE_LENGTH);
		const value = bytes[0] * 0x1000000 + ((bytes[1] << 16) | (bytes[2] << 8) | bytes[3]);
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "decode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} is less than minimum ${this.options.minimum}`,
				"UInt32Codec",
				value,
				this.options.minimum,
				reader.position
			);
		}

		if ((validationMode === "both" || validationMode === "decode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} exceeds maximum ${this.options.maximum}`,
				"UInt32Codec",
				value,
				this.options.maximum,
				reader.position
			);
		}

		return value;
	}
}

export class UInt40Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 5;

	constructor(private readonly byteOrderStrategy: ByteOrderStrategy, private readonly options?: UIntCodecOptions) {
		super();
	}

	isValid(value: unknown): value is number {
		if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value >= 1099511627776) return false;

		if (this.options?.minimum !== undefined && value < this.options.minimum) return false;
		if (this.options?.maximum !== undefined && value > this.options.maximum) return false;

		return true;
	}

	byteLength(): 5 {
		return UInt40Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "encode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} is less than minimum ${this.options.minimum}`,
				"UInt40Codec",
				value,
				this.options.minimum
			);
		}

		if ((validationMode === "both" || validationMode === "encode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} exceeds maximum ${this.options.maximum}`,
				"UInt40Codec",
				value,
				this.options.maximum
			);
		}

		this.byteOrderStrategy.write(writer, UInt40Codec.BYTE_LENGTH, (index) => {
			if (index === 0) return Math.floor(value / 0x100000000) & 0xff;

			return (value >>> ((4 - index) * 8)) & 0xff;
		});
	}

	_decode(reader: Reader): number {
		const bytes = this.byteOrderStrategy.read(reader, UInt40Codec.BYTE_LENGTH);
		const value = bytes[0] * 0x100000000 + bytes[1] * 0x1000000 + ((bytes[2] << 16) | (bytes[3] << 8) | bytes[4]);
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "decode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} is less than minimum ${this.options.minimum}`,
				"UInt40Codec",
				value,
				this.options.minimum,
				reader.position
			);
		}

		if ((validationMode === "both" || validationMode === "decode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} exceeds maximum ${this.options.maximum}`,
				"UInt40Codec",
				value,
				this.options.maximum,
				reader.position
			);
		}

		return value;
	}
}

export class UInt48Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 6;

	constructor(private readonly byteOrderStrategy: ByteOrderStrategy, private readonly options?: UIntCodecOptions) {
		super();
	}

	isValid(value: unknown): value is number {
		if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value >= 281474976710656) return false;

		if (this.options?.minimum !== undefined && value < this.options.minimum) return false;
		if (this.options?.maximum !== undefined && value > this.options.maximum) return false;

		return true;
	}

	byteLength(): 6 {
		return UInt48Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "encode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} is less than minimum ${this.options.minimum}`,
				"UInt48Codec",
				value,
				this.options.minimum
			);
		}

		if ((validationMode === "both" || validationMode === "encode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} exceeds maximum ${this.options.maximum}`,
				"UInt48Codec",
				value,
				this.options.maximum
			);
		}

		this.byteOrderStrategy.write(writer, UInt48Codec.BYTE_LENGTH, (index) => {
			if (index === 0) return Math.floor(value / 0x10000000000) & 0xff;
			if (index === 1) return Math.floor(value / 0x100000000) & 0xff;

			return (value >>> ((5 - index) * 8)) & 0xff;
		});
	}

	_decode(reader: Reader): number {
		const bytes = this.byteOrderStrategy.read(reader, UInt48Codec.BYTE_LENGTH);
		const value = bytes[0] * 0x10000000000 + bytes[1] * 0x100000000 + bytes[2] * 0x1000000 + ((bytes[3] << 16) | (bytes[4] << 8) | bytes[5]);
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "decode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} is less than minimum ${this.options.minimum}`,
				"UInt48Codec",
				value,
				this.options.minimum,
				reader.position
			);
		}

		if ((validationMode === "both" || validationMode === "decode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} exceeds maximum ${this.options.maximum}`,
				"UInt48Codec",
				value,
				this.options.maximum,
				reader.position
			);
		}

		return value;
	}
}

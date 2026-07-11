import { BufferfyRangeError } from "../../utilities/Error";
import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";

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

export interface NumberValidationOptions {
	minimum?: number;
	maximum?: number;
	validationMode?: ValidationMode;
}

export interface NumberValidators {
	validateEncode: ((value: number) => void) | null;
	validateDecode: ((value: number, position: number) => void) | null;
}

export const buildNumberValidators = (codecName: string, options?: NumberValidationOptions): NumberValidators => {
	const minimum = options?.minimum;
	const maximum = options?.maximum;
	const mode = options?.validationMode ?? "both";
	const hasRange = minimum !== undefined || maximum !== undefined;

	return {
		validateEncode:
			hasRange && (mode === "both" || mode === "encode")
				? (value: number): void => {
						if (minimum !== undefined && value < minimum)
							throw new BufferfyRangeError(`Encoded value ${value} is less than minimum ${minimum}`, codecName, value, minimum);
						if (maximum !== undefined && value > maximum)
							throw new BufferfyRangeError(`Encoded value ${value} exceeds maximum ${maximum}`, codecName, value, maximum);
					}
				: null,
		validateDecode:
			hasRange && (mode === "both" || mode === "decode")
				? (value: number, position: number): void => {
						if (minimum !== undefined && value < minimum)
							throw new BufferfyRangeError(`Decoded value ${value} is less than minimum ${minimum}`, codecName, value, minimum, position);
						if (maximum !== undefined && value > maximum)
							throw new BufferfyRangeError(`Decoded value ${value} exceeds maximum ${maximum}`, codecName, value, maximum, position);
					}
				: null,
	};
};

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
	switch (bits) {
		case 8:
			return new UInt8Codec(options);
		case 16:
			return new UInt16Codec(endianness, options);
		case 24:
			return new UInt24Codec(endianness, options);
		case 32:
			return new UInt32Codec(endianness, options);
		case 40:
			return new UInt40Codec(endianness, options);
		case 48:
			return new UInt48Codec(endianness, options);
	}
};

export class UInt8Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 1;

	private readonly _validateEncode: ((value: number) => void) | null;
	private readonly _validateDecode: ((value: number, position: number) => void) | null;

	constructor(private readonly options?: UIntCodecOptions) {
		super();

		const validators = buildNumberValidators("UInt8Codec", options);
		this._validateEncode = validators.validateEncode;
		this._validateDecode = validators.validateDecode;
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
		if (this._validateEncode !== null) this._validateEncode(value);

		writer.writeByte(value);
	}

	_decode(reader: Reader): number {
		const value = reader.readByte();

		if (this._validateDecode !== null) this._validateDecode(value, reader.position);

		return value;
	}
}

export class UInt16Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 2;

	private readonly _littleEndian: boolean;
	private readonly _validateEncode: ((value: number) => void) | null;
	private readonly _validateDecode: ((value: number, position: number) => void) | null;

	constructor(endianness: Endianness = "BE", private readonly options?: UIntCodecOptions) {
		super();

		this._littleEndian = endianness === "LE";

		const validators = buildNumberValidators("UInt16Codec", options);
		this._validateEncode = validators.validateEncode;
		this._validateDecode = validators.validateDecode;
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
		if (this._validateEncode !== null) this._validateEncode(value);

		writer.writeUint16(value, this._littleEndian);
	}

	_decode(reader: Reader): number {
		const value = reader.readUint16(this._littleEndian);

		if (this._validateDecode !== null) this._validateDecode(value, reader.position);

		return value;
	}
}

export class UInt24Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 3;

	private readonly _littleEndian: boolean;
	private readonly _validateEncode: ((value: number) => void) | null;
	private readonly _validateDecode: ((value: number, position: number) => void) | null;

	constructor(endianness: Endianness = "BE", private readonly options?: UIntCodecOptions) {
		super();

		this._littleEndian = endianness === "LE";

		const validators = buildNumberValidators("UInt24Codec", options);
		this._validateEncode = validators.validateEncode;
		this._validateDecode = validators.validateDecode;
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
		if (this._validateEncode !== null) this._validateEncode(value);

		writer.writeUint24(value, this._littleEndian);
	}

	_decode(reader: Reader): number {
		const value = reader.readUint24(this._littleEndian);

		if (this._validateDecode !== null) this._validateDecode(value, reader.position);

		return value;
	}
}

export class UInt32Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 4;

	private readonly _littleEndian: boolean;
	private readonly _validateEncode: ((value: number) => void) | null;
	private readonly _validateDecode: ((value: number, position: number) => void) | null;

	constructor(endianness: Endianness = "BE", private readonly options?: UIntCodecOptions) {
		super();

		this._littleEndian = endianness === "LE";

		const validators = buildNumberValidators("UInt32Codec", options);
		this._validateEncode = validators.validateEncode;
		this._validateDecode = validators.validateDecode;
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
		if (this._validateEncode !== null) this._validateEncode(value);

		writer.writeUint32(value, this._littleEndian);
	}

	_decode(reader: Reader): number {
		const value = reader.readUint32(this._littleEndian);

		if (this._validateDecode !== null) this._validateDecode(value, reader.position);

		return value;
	}
}

export class UInt40Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 5;

	private readonly _littleEndian: boolean;
	private readonly _validateEncode: ((value: number) => void) | null;
	private readonly _validateDecode: ((value: number, position: number) => void) | null;

	constructor(endianness: Endianness = "BE", private readonly options?: UIntCodecOptions) {
		super();

		this._littleEndian = endianness === "LE";

		const validators = buildNumberValidators("UInt40Codec", options);
		this._validateEncode = validators.validateEncode;
		this._validateDecode = validators.validateDecode;
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
		if (this._validateEncode !== null) this._validateEncode(value);

		writer.writeUint40(value, this._littleEndian);
	}

	_decode(reader: Reader): number {
		const value = reader.readUint40(this._littleEndian);

		if (this._validateDecode !== null) this._validateDecode(value, reader.position);

		return value;
	}
}

export class UInt48Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 6;

	private readonly _littleEndian: boolean;
	private readonly _validateEncode: ((value: number) => void) | null;
	private readonly _validateDecode: ((value: number, position: number) => void) | null;

	constructor(endianness: Endianness = "BE", private readonly options?: UIntCodecOptions) {
		super();

		this._littleEndian = endianness === "LE";

		const validators = buildNumberValidators("UInt48Codec", options);
		this._validateEncode = validators.validateEncode;
		this._validateDecode = validators.validateDecode;
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
		if (this._validateEncode !== null) this._validateEncode(value);

		writer.writeUint48(value, this._littleEndian);
	}

	_decode(reader: Reader): number {
		const value = reader.readUint48(this._littleEndian);

		if (this._validateDecode !== null) this._validateDecode(value, reader.position);

		return value;
	}
}

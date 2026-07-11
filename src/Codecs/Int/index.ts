import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { type Endianness, type UIntBits, type ValidationMode, buildNumberValidators } from "../UInt";

export interface IntCodecOptions {
	minimum?: number;
	maximum?: number;
	validationMode?: ValidationMode;
}

export type IntCodec = Int8Codec | Int16Codec | Int24Codec | Int32Codec | Int40Codec | Int48Codec;

/**
 * Creates a codec for a signed integer.
 *
 * Serializes to ```[INT]```
 *
 * Uses two's complement representation by wrapping unsigned integer codecs
 * with an offset transformation.
 *
 * @param	{8 | 16 | 24 | 32 | 40 | 48} [bits=48] - Bit type of integer.
 * @param	{'LE' | 'BE'} [endianness='BE'] - Endianness
 * @param	{IntCodecOptions} [options] - Validation options (minimum, maximum)
 * @return	{IntCodec} IntCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Int/index.ts|Source}
 */
export const createIntCodec = (bits: UIntBits = 48, endianness: Endianness = "BE", options?: IntCodecOptions): IntCodec => {
	switch (bits) {
		case 8:
			return new Int8Codec(options);
		case 16:
			return new Int16Codec(bits, endianness, options);
		case 24:
			return new Int24Codec(bits, endianness, options);
		case 32:
			return new Int32Codec(bits, endianness, options);
		case 40:
			return new Int40Codec(bits, endianness, options);
		case 48:
			return new Int48Codec(bits, endianness, options);
	}
};

export class Int8Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 1;
	static readonly OFFSET = 128;
	static readonly MIN_VALUE = -128;
	static readonly MAX_VALUE = 127;

	private readonly _validateEncode: ((value: number) => void) | null;
	private readonly _validateDecode: ((value: number, position: number) => void) | null;

	constructor(private readonly options?: IntCodecOptions) {
		super();

		const validators = buildNumberValidators("Int8Codec", options);
		this._validateEncode = validators.validateEncode;
		this._validateDecode = validators.validateDecode;
	}

	isValid(value: unknown): value is number {
		if (typeof value !== "number" || !Number.isInteger(value) || value < Int8Codec.MIN_VALUE || value > Int8Codec.MAX_VALUE) return false;

		if (this.options?.minimum !== undefined && value < this.options.minimum) return false;
		if (this.options?.maximum !== undefined && value > this.options.maximum) return false;

		return true;
	}

	byteLength(): 1 {
		return Int8Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		if (this._validateEncode !== null) this._validateEncode(value);

		writer.writeByte(value + Int8Codec.OFFSET);
	}

	_decode(reader: Reader): number {
		const value = reader.readByte() - Int8Codec.OFFSET;

		if (this._validateDecode !== null) this._validateDecode(value, reader.position);

		return value;
	}
}

export class Int16Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 2;
	static readonly OFFSET = 32768;
	static readonly MIN_VALUE = -32768;
	static readonly MAX_VALUE = 32767;

	private readonly _littleEndian: boolean;
	private readonly _validateEncode: ((value: number) => void) | null;
	private readonly _validateDecode: ((value: number, position: number) => void) | null;

	constructor(_bits: Extract<UIntBits, 16>, endianness: Endianness = "BE", private readonly options?: IntCodecOptions) {
		super();

		this._littleEndian = endianness === "LE";

		const validators = buildNumberValidators("Int16Codec", options);
		this._validateEncode = validators.validateEncode;
		this._validateDecode = validators.validateDecode;
	}

	isValid(value: unknown): value is number {
		if (typeof value !== "number" || !Number.isInteger(value) || value < Int16Codec.MIN_VALUE || value > Int16Codec.MAX_VALUE) return false;

		if (this.options?.minimum !== undefined && value < this.options.minimum) return false;
		if (this.options?.maximum !== undefined && value > this.options.maximum) return false;

		return true;
	}

	byteLength(): 2 {
		return Int16Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		if (this._validateEncode !== null) this._validateEncode(value);

		writer.writeUint16(value + Int16Codec.OFFSET, this._littleEndian);
	}

	_decode(reader: Reader): number {
		const value = reader.readUint16(this._littleEndian) - Int16Codec.OFFSET;

		if (this._validateDecode !== null) this._validateDecode(value, reader.position);

		return value;
	}
}

export class Int24Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 3;
	static readonly OFFSET = 8388608;
	static readonly MIN_VALUE = -8388608;
	static readonly MAX_VALUE = 8388607;

	private readonly _littleEndian: boolean;
	private readonly _validateEncode: ((value: number) => void) | null;
	private readonly _validateDecode: ((value: number, position: number) => void) | null;

	constructor(_bits: Extract<UIntBits, 24>, endianness: Endianness = "BE", private readonly options?: IntCodecOptions) {
		super();

		this._littleEndian = endianness === "LE";

		const validators = buildNumberValidators("Int24Codec", options);
		this._validateEncode = validators.validateEncode;
		this._validateDecode = validators.validateDecode;
	}

	isValid(value: unknown): value is number {
		if (typeof value !== "number" || !Number.isInteger(value) || value < Int24Codec.MIN_VALUE || value > Int24Codec.MAX_VALUE) return false;

		if (this.options?.minimum !== undefined && value < this.options.minimum) return false;
		if (this.options?.maximum !== undefined && value > this.options.maximum) return false;

		return true;
	}

	byteLength(): 3 {
		return Int24Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		if (this._validateEncode !== null) this._validateEncode(value);

		writer.writeUint24(value + Int24Codec.OFFSET, this._littleEndian);
	}

	_decode(reader: Reader): number {
		const value = reader.readUint24(this._littleEndian) - Int24Codec.OFFSET;

		if (this._validateDecode !== null) this._validateDecode(value, reader.position);

		return value;
	}
}

export class Int32Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 4;
	static readonly OFFSET = 2147483648;
	static readonly MIN_VALUE = -2147483648;
	static readonly MAX_VALUE = 2147483647;

	private readonly _littleEndian: boolean;
	private readonly _validateEncode: ((value: number) => void) | null;
	private readonly _validateDecode: ((value: number, position: number) => void) | null;

	constructor(_bits: Extract<UIntBits, 32>, endianness: Endianness = "BE", private readonly options?: IntCodecOptions) {
		super();

		this._littleEndian = endianness === "LE";

		const validators = buildNumberValidators("Int32Codec", options);
		this._validateEncode = validators.validateEncode;
		this._validateDecode = validators.validateDecode;
	}

	isValid(value: unknown): value is number {
		if (typeof value !== "number" || !Number.isInteger(value) || value < Int32Codec.MIN_VALUE || value > Int32Codec.MAX_VALUE) return false;

		if (this.options?.minimum !== undefined && value < this.options.minimum) return false;
		if (this.options?.maximum !== undefined && value > this.options.maximum) return false;

		return true;
	}

	byteLength(): 4 {
		return Int32Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		if (this._validateEncode !== null) this._validateEncode(value);

		writer.writeUint32(value + Int32Codec.OFFSET, this._littleEndian);
	}

	_decode(reader: Reader): number {
		const value = reader.readUint32(this._littleEndian) - Int32Codec.OFFSET;

		if (this._validateDecode !== null) this._validateDecode(value, reader.position);

		return value;
	}
}

export class Int40Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 5;
	static readonly OFFSET = 549755813888;
	static readonly MIN_VALUE = -549755813888;
	static readonly MAX_VALUE = 549755813887;

	private readonly _littleEndian: boolean;
	private readonly _validateEncode: ((value: number) => void) | null;
	private readonly _validateDecode: ((value: number, position: number) => void) | null;

	constructor(_bits: Extract<UIntBits, 40>, endianness: Endianness = "BE", private readonly options?: IntCodecOptions) {
		super();

		this._littleEndian = endianness === "LE";

		const validators = buildNumberValidators("Int40Codec", options);
		this._validateEncode = validators.validateEncode;
		this._validateDecode = validators.validateDecode;
	}

	isValid(value: unknown): value is number {
		if (typeof value !== "number" || !Number.isInteger(value) || value < Int40Codec.MIN_VALUE || value > Int40Codec.MAX_VALUE) return false;

		if (this.options?.minimum !== undefined && value < this.options.minimum) return false;
		if (this.options?.maximum !== undefined && value > this.options.maximum) return false;

		return true;
	}

	byteLength(): 5 {
		return Int40Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		if (this._validateEncode !== null) this._validateEncode(value);

		writer.writeUint40(value + Int40Codec.OFFSET, this._littleEndian);
	}

	_decode(reader: Reader): number {
		const value = reader.readUint40(this._littleEndian) - Int40Codec.OFFSET;

		if (this._validateDecode !== null) this._validateDecode(value, reader.position);

		return value;
	}
}

export class Int48Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 6;
	static readonly OFFSET = 140737488355328;
	static readonly MIN_VALUE = -140737488355328;
	static readonly MAX_VALUE = 140737488355327;

	private readonly _littleEndian: boolean;
	private readonly _validateEncode: ((value: number) => void) | null;
	private readonly _validateDecode: ((value: number, position: number) => void) | null;

	constructor(_bits: Extract<UIntBits, 48>, endianness: Endianness = "BE", private readonly options?: IntCodecOptions) {
		super();

		this._littleEndian = endianness === "LE";

		const validators = buildNumberValidators("Int48Codec", options);
		this._validateEncode = validators.validateEncode;
		this._validateDecode = validators.validateDecode;
	}

	isValid(value: unknown): value is number {
		if (typeof value !== "number" || !Number.isInteger(value) || value < Int48Codec.MIN_VALUE || value > Int48Codec.MAX_VALUE) return false;

		if (this.options?.minimum !== undefined && value < this.options.minimum) return false;
		if (this.options?.maximum !== undefined && value > this.options.maximum) return false;

		return true;
	}

	byteLength(): 6 {
		return Int48Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		if (this._validateEncode !== null) this._validateEncode(value);

		writer.writeUint48(value + Int48Codec.OFFSET, this._littleEndian);
	}

	_decode(reader: Reader): number {
		const value = reader.readUint48(this._littleEndian) - Int48Codec.OFFSET;

		if (this._validateDecode !== null) this._validateDecode(value, reader.position);

		return value;
	}
}

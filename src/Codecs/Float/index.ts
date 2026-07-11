import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { type Endianness, type ValidationMode, buildNumberValidators } from "../UInt";

export const floatBitValues = [32, 64] as const;

export type FloatBits = (typeof floatBitValues)[number];

export const FLOAT_BIT_BYTE_MAP = {
	32: 4,
	64: 8,
} as const;

export interface FloatCodecOptions {
	minimum?: number;
	maximum?: number;
	validationMode?: ValidationMode;
}

export type FloatCodec = Float32BECodec | Float32LECodec | Float64BECodec | Float64LECodec;

/**
 * Creates a codec for a float or double.
 *
 * Serializes to ```[FLOAT]```
 *
 * **Note on special values**: This codec encodes NaN, Infinity, and -Infinity
 * according to IEEE 754 standard. NaN values are preserved but may not maintain
 * their exact bit pattern. Signaling NaN vs Quiet NaN distinction is not guaranteed.
 *
 * @param	{32 | 64} [bits=32] - Bit type of float.
 * @param	{'LE' | 'BE'} [endianness='BE'] - Endianness
 * @param	{FloatCodecOptions} [options] - Validation options (minimum, maximum)
 * @return	{FloatCodec} FloatCodec
 *
 * {@link https://github.com/visionsofparadise/dataViewfy/blob/main/src/Codecs/Float/index.ts|Source}
 */
export const createFloatCodec = (bits: FloatBits = 64, endianness: Endianness = "BE", options?: FloatCodecOptions) => {
	switch (endianness) {
		case "BE": {
			switch (bits) {
				case 32: {
					return new Float32BECodec(options);
				}
				case 64: {
					return new Float64BECodec(options);
				}
			}
		}
		case "LE": {
			switch (bits) {
				case 32: {
					return new Float32LECodec(options);
				}
				case 64: {
					return new Float64LECodec(options);
				}
			}
		}
	}
};

export class Float32BECodec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 4;

	protected readonly _validateEncode: ((value: number) => void) | null;
	protected readonly _validateDecode: ((value: number, position: number) => void) | null;

	constructor(protected readonly options?: FloatCodecOptions) {
		super();

		const validators = buildNumberValidators(this.constructor.name, options);
		this._validateEncode = validators.validateEncode;
		this._validateDecode = validators.validateDecode;
	}

	isValid(value: unknown): value is number {
		if (typeof value !== "number") return false;

		if (this.options?.minimum !== undefined && value < this.options.minimum) return false;
		if (this.options?.maximum !== undefined && value > this.options.maximum) return false;

		return true;
	}

	byteLength(): 4 {
		return Float32BECodec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		if (this._validateEncode !== null) this._validateEncode(value);

		writer.writeFloat32(value, false);
	}

	_decode(reader: Reader): number {
		const value = reader.readFloat32(false);

		if (this._validateDecode !== null) this._validateDecode(value, reader.position);

		return value;
	}
}

export class Float32LECodec extends Float32BECodec {
	_encode(value: number, writer: Writer): void {
		if (this._validateEncode !== null) this._validateEncode(value);

		writer.writeFloat32(value, true);
	}

	_decode(reader: Reader): number {
		const value = reader.readFloat32(true);

		if (this._validateDecode !== null) this._validateDecode(value, reader.position);

		return value;
	}
}

export class Float64BECodec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 8;

	protected readonly _validateEncode: ((value: number) => void) | null;
	protected readonly _validateDecode: ((value: number, position: number) => void) | null;

	constructor(protected readonly options?: FloatCodecOptions) {
		super();

		const validators = buildNumberValidators(this.constructor.name, options);
		this._validateEncode = validators.validateEncode;
		this._validateDecode = validators.validateDecode;
	}

	isValid(value: unknown): value is number {
		if (typeof value !== "number") return false;

		if (this.options?.minimum !== undefined && value < this.options.minimum) return false;
		if (this.options?.maximum !== undefined && value > this.options.maximum) return false;

		return true;
	}

	byteLength(): 8 {
		return Float64BECodec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		if (this._validateEncode !== null) this._validateEncode(value);

		writer.writeFloat64(value, false);
	}

	_decode(reader: Reader): number {
		const value = reader.readFloat64(false);

		if (this._validateDecode !== null) this._validateDecode(value, reader.position);

		return value;
	}
}

export class Float64LECodec extends Float64BECodec {
	_encode(value: number, writer: Writer): void {
		if (this._validateEncode !== null) this._validateEncode(value);

		writer.writeFloat64(value, true);
	}

	_decode(reader: Reader): number {
		const value = reader.readFloat64(true);

		if (this._validateDecode !== null) this._validateDecode(value, reader.position);

		return value;
	}
}

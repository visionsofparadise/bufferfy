import { BufferfyRangeError } from "../../utilities/Error";
import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { type Endianness, type ValidationMode } from "../UInt";

export interface BigUIntCodecOptions {
	minimum?: bigint;
	maximum?: bigint;
	validationMode?: ValidationMode;
}

interface BigUIntValidators {
	validateEncode: ((value: bigint) => void) | null;
	validateDecode: ((value: bigint, position: number) => void) | null;
}

const buildBigUIntValidators = (codecName: string, options?: BigUIntCodecOptions): BigUIntValidators => {
	const minimum = options?.minimum;
	const maximum = options?.maximum;
	const mode = options?.validationMode ?? "both";
	const hasRange = minimum !== undefined || maximum !== undefined;

	return {
		validateEncode:
			hasRange && (mode === "both" || mode === "encode")
				? (value: bigint): void => {
						if (minimum !== undefined && value < minimum)
							throw new BufferfyRangeError(`Encoded value ${value} is less than minimum ${minimum}`, codecName, value, undefined);
						if (maximum !== undefined && value > maximum)
							throw new BufferfyRangeError(`Encoded value ${value} exceeds maximum ${maximum}`, codecName, value, undefined);
					}
				: null,
		validateDecode:
			hasRange && (mode === "both" || mode === "decode")
				? (value: bigint, position: number): void => {
						if (minimum !== undefined && value < minimum)
							throw new BufferfyRangeError(`Decoded value ${value} is less than minimum ${minimum}`, codecName, value, undefined, position);
						if (maximum !== undefined && value > maximum)
							throw new BufferfyRangeError(`Decoded value ${value} exceeds maximum ${maximum}`, codecName, value, undefined, position);
					}
				: null,
	};
};

/**
 * Creates a codec for a bigint.
 *
 * Serializes to ```[UINT64]```
 *
 * @param	{'LE' | 'BE'} [endianness='BE'] - Endianness
 * @param	{BigUIntCodecOptions} [options] - Validation options (minimum, maximum)
 * @return	{BigUIntCodec} BigUIntCodec
 *
 * {@link https://github.com/visionsofparadise/dataViewfy/blob/main/src/Codecs/BigUInt/index.ts|Source}
 */
export const createBigUIntCodec = (endianness: Endianness = "BE", options?: BigUIntCodecOptions) => {
	switch (endianness) {
		case "BE": {
			return new BigUIntBECodec(options);
		}
		case "LE": {
			return new BigUIntLECodec(options);
		}
	}
};

export class BigUIntBECodec extends AbstractCodec<bigint> {
	static readonly BYTE_LENGTH = 8;

	protected readonly _validateEncode: ((value: bigint) => void) | null;
	protected readonly _validateDecode: ((value: bigint, position: number) => void) | null;

	constructor(protected readonly options?: BigUIntCodecOptions) {
		super();

		const validators = buildBigUIntValidators(this.constructor.name, options);
		this._validateEncode = validators.validateEncode;
		this._validateDecode = validators.validateDecode;
	}

	isValid(value: unknown): value is bigint {
		if (typeof value !== "bigint") return false;

		if (this.options?.minimum !== undefined && value < this.options.minimum) return false;
		if (this.options?.maximum !== undefined && value > this.options.maximum) return false;

		return true;
	}

	byteLength(): 8 {
		return BigUIntBECodec.BYTE_LENGTH;
	}

	_encode(value: bigint, writer: Writer): void {
		if (this._validateEncode !== null) this._validateEncode(value);

		writer.writeBigUint64(value, false);
	}

	_decode(reader: Reader): bigint {
		const value = reader.readBigUint64(false);

		if (this._validateDecode !== null) this._validateDecode(value, reader.position);

		return value;
	}
}

export class BigUIntLECodec extends BigUIntBECodec {
	_encode(value: bigint, writer: Writer): void {
		if (this._validateEncode !== null) this._validateEncode(value);

		writer.writeBigUint64(value, true);
	}

	_decode(reader: Reader): bigint {
		const value = reader.readBigUint64(true);

		if (this._validateDecode !== null) this._validateDecode(value, reader.position);

		return value;
	}
}

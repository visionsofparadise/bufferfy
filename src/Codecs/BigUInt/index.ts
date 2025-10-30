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

	constructor(protected readonly options?: BigUIntCodecOptions) {
		super();
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
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "encode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} is less than minimum ${this.options.minimum}`,
				"BigUIntBECodec",
				value,
				undefined
			);
		}

		if ((validationMode === "both" || validationMode === "encode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} exceeds maximum ${this.options.maximum}`,
				"BigUIntBECodec",
				value,
				undefined
			);
		}

		writer.writeDataView(BigUIntBECodec.BYTE_LENGTH, (view, offset) => view.setBigUint64(offset, value, false));
	}

	_decode(reader: Reader): bigint {
		const value = reader.readDataView(BigUIntBECodec.BYTE_LENGTH, (view, offset) => view.getBigUint64(offset, false));
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "decode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} is less than minimum ${this.options.minimum}`,
				"BigUIntBECodec",
				value,
				undefined,
				reader.position
			);
		}

		if ((validationMode === "both" || validationMode === "decode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} exceeds maximum ${this.options.maximum}`,
				"BigUIntBECodec",
				value,
				undefined,
				reader.position
			);
		}

		return value;
	}
}

export class BigUIntLECodec extends BigUIntBECodec {
	_encode(value: bigint, writer: Writer): void {
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "encode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} is less than minimum ${this.options.minimum}`,
				"BigUIntLECodec",
				value,
				undefined
			);
		}

		if ((validationMode === "both" || validationMode === "encode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} exceeds maximum ${this.options.maximum}`,
				"BigUIntLECodec",
				value,
				undefined
			);
		}

		writer.writeDataView(BigUIntBECodec.BYTE_LENGTH, (view, offset) => view.setBigUint64(offset, value, true));
	}

	_decode(reader: Reader): bigint {
		const value = reader.readDataView(BigUIntBECodec.BYTE_LENGTH, (view, offset) => view.getBigUint64(offset, true));
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "decode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} is less than minimum ${this.options.minimum}`,
				"BigUIntLECodec",
				value,
				undefined,
				reader.position
			);
		}

		if ((validationMode === "both" || validationMode === "decode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} exceeds maximum ${this.options.maximum}`,
				"BigUIntLECodec",
				value,
				undefined,
				reader.position
			);
		}

		return value;
	}
}

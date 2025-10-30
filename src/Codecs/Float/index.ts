import { BufferfyRangeError } from "../../utilities/Error";
import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { type Endianness, type ValidationMode } from "../UInt";

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

	constructor(protected readonly options?: FloatCodecOptions) {
		super();
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
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "encode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} is less than minimum ${this.options.minimum}`,
				"Float32BECodec",
				value,
				this.options.minimum
			);
		}

		if ((validationMode === "both" || validationMode === "encode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} exceeds maximum ${this.options.maximum}`,
				"Float32BECodec",
				value,
				this.options.maximum
			);
		}

		writer.writeDataView(Float32BECodec.BYTE_LENGTH, (view, offset) => view.setFloat32(offset, value, false));
	}

	_decode(reader: Reader): number {
		const value = reader.readDataView(Float32BECodec.BYTE_LENGTH, (view, offset) => view.getFloat32(offset, false));
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "decode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} is less than minimum ${this.options.minimum}`,
				"Float32BECodec",
				value,
				this.options.minimum,
				reader.position
			);
		}

		if ((validationMode === "both" || validationMode === "decode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} exceeds maximum ${this.options.maximum}`,
				"Float32BECodec",
				value,
				this.options.maximum,
				reader.position
			);
		}

		return value;
	}
}

export class Float32LECodec extends Float32BECodec {
	_encode(value: number, writer: Writer): void {
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "encode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} is less than minimum ${this.options.minimum}`,
				"Float32LECodec",
				value,
				this.options.minimum
			);
		}

		if ((validationMode === "both" || validationMode === "encode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} exceeds maximum ${this.options.maximum}`,
				"Float32LECodec",
				value,
				this.options.maximum
			);
		}

		writer.writeDataView(Float32BECodec.BYTE_LENGTH, (view, offset) => view.setFloat32(offset, value, true));
	}

	_decode(reader: Reader): number {
		const value = reader.readDataView(Float32BECodec.BYTE_LENGTH, (view, offset) => view.getFloat32(offset, true));
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "decode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} is less than minimum ${this.options.minimum}`,
				"Float32LECodec",
				value,
				this.options.minimum,
				reader.position
			);
		}

		if ((validationMode === "both" || validationMode === "decode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} exceeds maximum ${this.options.maximum}`,
				"Float32LECodec",
				value,
				this.options.maximum,
				reader.position
			);
		}

		return value;
	}
}

export class Float64BECodec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 8;

	constructor(protected readonly options?: FloatCodecOptions) {
		super();
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
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "encode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} is less than minimum ${this.options.minimum}`,
				"Float64BECodec",
				value,
				this.options.minimum
			);
		}

		if ((validationMode === "both" || validationMode === "encode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} exceeds maximum ${this.options.maximum}`,
				"Float64BECodec",
				value,
				this.options.maximum
			);
		}

		writer.writeDataView(Float64BECodec.BYTE_LENGTH, (view, offset) => view.setFloat64(offset, value, false));
	}

	_decode(reader: Reader): number {
		const value = reader.readDataView(Float64BECodec.BYTE_LENGTH, (view, offset) => view.getFloat64(offset, false));
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "decode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} is less than minimum ${this.options.minimum}`,
				"Float64BECodec",
				value,
				this.options.minimum,
				reader.position
			);
		}

		if ((validationMode === "both" || validationMode === "decode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} exceeds maximum ${this.options.maximum}`,
				"Float64BECodec",
				value,
				this.options.maximum,
				reader.position
			);
		}

		return value;
	}
}

export class Float64LECodec extends Float64BECodec {
	_encode(value: number, writer: Writer): void {
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "encode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} is less than minimum ${this.options.minimum}`,
				"Float64LECodec",
				value,
				this.options.minimum
			);
		}

		if ((validationMode === "both" || validationMode === "encode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} exceeds maximum ${this.options.maximum}`,
				"Float64LECodec",
				value,
				this.options.maximum
			);
		}

		writer.writeDataView(Float64BECodec.BYTE_LENGTH, (view, offset) => view.setFloat64(offset, value, true));
	}

	_decode(reader: Reader): number {
		const value = reader.readDataView(Float64BECodec.BYTE_LENGTH, (view, offset) => view.getFloat64(offset, true));
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "decode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} is less than minimum ${this.options.minimum}`,
				"Float64LECodec",
				value,
				this.options.minimum,
				reader.position
			);
		}

		if ((validationMode === "both" || validationMode === "decode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} exceeds maximum ${this.options.maximum}`,
				"Float64LECodec",
				value,
				this.options.maximum,
				reader.position
			);
		}

		return value;
	}
}

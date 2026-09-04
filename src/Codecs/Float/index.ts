import { NUMBER_MATCHER, type CodecMatcher } from "../../utilities/matcher";
import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import type { Endianness } from "../UInt";

export const floatBitValues = [32, 64] as const;

export type FloatBits = (typeof floatBitValues)[number];

export const FLOAT_BIT_BYTE_MAP = {
	32: 4,
	64: 8,
} as const;

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
 * @return	{FloatCodec} FloatCodec
 *
 * {@link https://github.com/visionsofparadise/dataViewfy/blob/main/src/Codecs/Float/index.ts|Source}
 */
export const createFloatCodec = (bits: FloatBits = 64, endianness: Endianness = "BE") => {
	if (endianness === "BE") {
		switch (bits) {
			case 32: {
				return new Float32BECodec();
			}

			case 64: {
				return new Float64BECodec();
			}
		}
	} else {
		switch (bits) {
			case 32: {
				return new Float32LECodec();
			}

			case 64: {
				return new Float64LECodec();
			}
		}
	}
};

export class Float32BECodec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 4;

	isValid(value: unknown): value is number {
		return typeof value === "number";
	}

	override get matcher(): CodecMatcher {
		return NUMBER_MATCHER;
	}

	byteLength(): 4 {
		return Float32BECodec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		const offset = writer.reserve(4);

		writer.currentView.setFloat32(offset, value, false);
	}

	_decode(reader: Reader): number {
		const offset = reader.skipBytes(4);

		return reader.view.getFloat32(offset, false);
	}
}

export class Float32LECodec extends Float32BECodec {
	override _encode(value: number, writer: Writer): void {
		const offset = writer.reserve(4);

		writer.currentView.setFloat32(offset, value, true);
	}

	override _decode(reader: Reader): number {
		const offset = reader.skipBytes(4);

		return reader.view.getFloat32(offset, true);
	}
}

export class Float64BECodec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 8;

	isValid(value: unknown): value is number {
		return typeof value === "number";
	}

	override get matcher(): CodecMatcher {
		return NUMBER_MATCHER;
	}

	byteLength(): 8 {
		return Float64BECodec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		const offset = writer.reserve(8);

		writer.currentView.setFloat64(offset, value, false);
	}

	_decode(reader: Reader): number {
		const offset = reader.skipBytes(8);

		return reader.view.getFloat64(offset, false);
	}
}

export class Float64LECodec extends Float64BECodec {
	override _encode(value: number, writer: Writer): void {
		const offset = writer.reserve(8);

		writer.currentView.setFloat64(offset, value, true);
	}

	override _decode(reader: Reader): number {
		const offset = reader.skipBytes(8);

		return reader.view.getFloat64(offset, true);
	}
}

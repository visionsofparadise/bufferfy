import { endianness as osEndianness } from "os";
import { Context } from "../../utilities/Context";
import { AbstractCodec } from "../Abstract";
import { DecodeTransform } from "../Abstract/DecodeTransform";
import { Endianness } from "../UInt";

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
 * @param	{32 | 64} [bits=32] - Bit type of float.
 * @param	{'LE' | 'BE'} [endianness=os.endianness()] - Endianness
 * @return	{FloatCodec} FloatCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Float/index.ts|Source}
 */
export const createFloatCodec = (bits: FloatBits = 64, endianness: Endianness = osEndianness()) => {
	switch (endianness) {
		case "BE": {
			switch (bits) {
				case 32: {
					return new Float32BECodec();
				}
				case 64: {
					return new Float64BECodec();
				}
			}
		}
		case "LE": {
			switch (bits) {
				case 32: {
					return new Float32LECodec();
				}
				case 64: {
					return new Float64LECodec();
				}
			}
		}
	}
};

export class Float32BECodec extends AbstractCodec<number> {
	isValid(value: unknown): value is number {
		return typeof value === "number";
	}

	byteLength(_: number): 4 {
		return 4;
	}

	_encode(value: number, buffer: Buffer, c: Context): void {
		c.offset = buffer.writeFloatBE(value, c.offset);
	}

	_decode(buffer: Buffer, c: Context): number {
		const value = buffer.readFloatBE(c.offset);

		c.offset += 4;

		return value;
	}

	async _decodeChunks(transform: DecodeTransform): Promise<number> {
		const buffer = await transform.consume(4);

		return this.decode(buffer);
	}
}

export class Float32LECodec extends Float32BECodec {
	_encode(value: number, buffer: Buffer, c: Context): void {
		c.offset = buffer.writeFloatLE(value, c.offset);
	}

	_decode(buffer: Buffer, offset: Context): number {
		const value = buffer.readFloatLE(offset.offset);

		offset.offset += 4;

		return value;
	}
}

export class Float64BECodec extends AbstractCodec<number> {
	isValid(value: unknown): value is number {
		return typeof value === "number";
	}

	byteLength(_: number): 8 {
		return 8;
	}

	_encode(value: number, buffer: Buffer, c: Context): void {
		c.offset = buffer.writeDoubleBE(value, c.offset);
	}

	_decode(buffer: Buffer, offset: Context): number {
		const value = buffer.readDoubleBE(offset.offset);

		offset.offset += 8;

		return value;
	}

	async _decodeChunks(transform: DecodeTransform): Promise<number> {
		const buffer = await transform.consume(8);

		return this.decode(buffer);
	}
}

export class Float64LECodec extends Float64BECodec {
	_encode(value: number, buffer: Buffer, c: Context): void {
		c.offset = buffer.writeDoubleLE(value, c.offset);
	}

	_decode(buffer: Buffer, offset: Context): number {
		const value = buffer.readDoubleLE(offset.offset);

		offset.offset += 8;

		return value;
	}
}

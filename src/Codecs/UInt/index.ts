import { endianness as osEndianness } from "os";
import { Context } from "../../utilities/Context";
import { BufferfyByteLengthError } from "../../utilities/Error";
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

export type UIntCodec = UInt8Codec | UInt16BECodec | UInt16LECodec | UInt24BECodec | UInt24LECodec | UInt32BECodec | UInt32LECodec | UInt40BECodec | UInt40LECodec | UInt48BECodec | UInt48LECodec;

/**
 * Creates a codec for a unsigned integer.
 *
 * Serializes to ```[UINT]```
 *
 * @param	{8 | 16 | 24 | 32 | 40 | 48} [bits=48] - Bit type of integer.
 * @param	{'LE' | 'BE'} [endianness=os.endianness()] - Endianness
 * @return	{UIntCodec} UIntCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/UInt/index.ts|Source}
 */
export const createUIntCodec = (bits: UIntBits = 48, endianness: Endianness = osEndianness()) => {
	if (bits === 8) return new UInt8Codec();

	switch (endianness) {
		case "BE": {
			switch (bits) {
				case 16: {
					return new UInt16BECodec();
				}
				case 24: {
					return new UInt24BECodec();
				}
				case 32: {
					return new UInt32BECodec();
				}
				case 40: {
					return new UInt40BECodec();
				}
				case 48: {
					return new UInt48BECodec();
				}
			}
		}
		case "LE": {
			switch (bits) {
				case 16: {
					return new UInt16LECodec();
				}
				case 24: {
					return new UInt24LECodec();
				}
				case 32: {
					return new UInt32LECodec();
				}
				case 40: {
					return new UInt40LECodec();
				}
				case 48: {
					return new UInt48LECodec();
				}
			}
		}
	}
};

export class UInt8Codec extends AbstractCodec<number> {
	constructor() {
		super();
	}

	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 256;
	}

	byteLength(_: number): 1 {
		return 1;
	}

	_encode(value: number, buffer: Uint8Array, c: Context): void {
		buffer[c.offset++] = value;
	}

	_decode(buffer: Uint8Array, c: Context): number {
		if (buffer.byteLength < c.offset + 1) throw new BufferfyByteLengthError();

		return buffer[c.offset++];
	}
}

export class UInt16BECodec extends AbstractCodec<number> {
	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 65536;
	}

	byteLength(_: number): 2 {
		return 2;
	}

	_encode(value: number, buffer: Uint8Array, c: Context): void {
		buffer[c.offset++] = value >>> 8;
		buffer[c.offset++] = value & 0xff;
	}

	_decode(buffer: Uint8Array, c: Context): number {
		if (buffer.byteLength < c.offset + 2) throw new BufferfyByteLengthError();

		return buffer[c.offset++] * 2 ** 8 + buffer[c.offset++];
	}
}

export class UInt16LECodec extends UInt16BECodec {
	_encode(value: number, buffer: Uint8Array, c: Context): void {
		buffer[c.offset++] = value & 0xff;
		buffer[c.offset++] = value >>> 8;
	}

	_decode(buffer: Uint8Array, c: Context): number {
		if (buffer.byteLength < c.offset + 2) throw new BufferfyByteLengthError();

		return buffer[c.offset++] + buffer[c.offset++] * 2 ** 8;
	}
}

export class UInt24BECodec extends AbstractCodec<number> {
	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 16777216;
	}

	byteLength(_: number): 3 {
		return 3;
	}

	_encode(value: number, buffer: Uint8Array, c: Context): void {
		buffer[c.offset++] = value >>> 16;
		buffer[c.offset++] = (value >>> 8) & 0xff;
		buffer[c.offset++] = value & 0xff;
	}

	_decode(buffer: Uint8Array, c: Context): number {
		if (buffer.byteLength < c.offset + 3) throw new BufferfyByteLengthError();

		return buffer[c.offset++] * 2 ** 16 + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++];
	}
}

export class UInt24LECodec extends UInt24BECodec {
	_encode(value: number, buffer: Uint8Array, c: Context): void {
		buffer[c.offset++] = value & 0xff;
		buffer[c.offset++] = (value >>> 8) & 0xff;
		buffer[c.offset++] = value >>> 16;
	}

	_decode(buffer: Uint8Array, c: Context): number {
		if (buffer.byteLength < c.offset + 3) throw new BufferfyByteLengthError();

		return buffer[c.offset++] + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++] * 2 ** 16;
	}
}

export class UInt32BECodec extends AbstractCodec<number> {
	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 4294967296;
	}

	byteLength(_: number): 4 {
		return 4;
	}

	_encode(value: number, buffer: Uint8Array, c: Context): void {
		buffer[c.offset++] = value >>> 24;
		buffer[c.offset++] = (value >>> 16) & 0xff;
		buffer[c.offset++] = (value >>> 8) & 0xff;
		buffer[c.offset++] = value & 0xff;
	}

	_decode(buffer: Uint8Array, c: Context): number {
		if (buffer.byteLength < c.offset + 4) throw new BufferfyByteLengthError();

		return buffer[c.offset++] * 2 ** 24 + buffer[c.offset++] * 2 ** 16 + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++];
	}
}

export class UInt32LECodec extends UInt32BECodec {
	_encode(value: number, buffer: Uint8Array, c: Context): void {
		buffer[c.offset++] = value >>> 24;
		buffer[c.offset++] = (value >>> 16) & 0xff;
		buffer[c.offset++] = (value >>> 8) & 0xff;
		buffer[c.offset++] = value & 0xff;
	}

	_decode(buffer: Uint8Array, c: Context): number {
		if (buffer.byteLength < c.offset + 4) throw new BufferfyByteLengthError();

		return buffer[c.offset++] * 2 ** 24 + buffer[c.offset++] * 2 ** 16 + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++];
	}
}

export class UInt40BECodec extends AbstractCodec<number> {
	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 1099511627776;
	}

	byteLength(_: number): 5 {
		return 5;
	}

	_encode(value: number, buffer: Uint8Array, c: Context): void {
		buffer[c.offset++] = value / 2 ** 32;
		buffer[c.offset++] = (value >>> 24) & 0xff;
		buffer[c.offset++] = (value >>> 16) & 0xff;
		buffer[c.offset++] = (value >>> 8) & 0xff;
		buffer[c.offset++] = value & 0xff;
	}

	_decode(buffer: Uint8Array, c: Context): number {
		if (buffer.byteLength < c.offset + 5) throw new BufferfyByteLengthError();

		return buffer[c.offset++] * 2 ** 32 + buffer[c.offset++] * 2 ** 24 + buffer[c.offset++] * 2 ** 16 + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++];
	}
}

export class UInt40LECodec extends UInt40BECodec {
	_encode(value: number, buffer: Uint8Array, c: Context): void {
		buffer[c.offset++] = value & 0xff;
		buffer[c.offset++] = (value >>> 8) & 0xff;
		buffer[c.offset++] = (value >>> 16) & 0xff;
		buffer[c.offset++] = (value >>> 24) & 0xff;
		buffer[c.offset++] = value / 2 ** 32;
	}

	_decode(buffer: Uint8Array, c: Context): number {
		if (buffer.byteLength < c.offset + 5) throw new BufferfyByteLengthError();

		return buffer[c.offset++] + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++] * 2 ** 16 + buffer[c.offset++] * 2 ** 24 + buffer[c.offset++] * 2 ** 32;
	}
}

export class UInt48BECodec extends AbstractCodec<number> {
	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 281474976710656;
	}

	byteLength(_: number): 6 {
		return 6;
	}

	_encode(value: number, buffer: Uint8Array, c: Context): void {
		buffer[c.offset++] = value / 2 ** 40;
		buffer[c.offset++] = (value / 2 ** 32) & 0xff;
		buffer[c.offset++] = (value >>> 24) & 0xff;
		buffer[c.offset++] = (value >>> 16) & 0xff;
		buffer[c.offset++] = (value >>> 8) & 0xff;
		buffer[c.offset++] = value & 0xff;
	}

	_decode(buffer: Uint8Array, c: Context): number {
		if (buffer.byteLength < c.offset + 6) throw new BufferfyByteLengthError();

		return buffer[c.offset++] * 2 ** 40 + buffer[c.offset++] * 2 ** 32 + buffer[c.offset++] * 2 ** 24 + buffer[c.offset++] * 2 ** 16 + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++];
	}
}

export class UInt48LECodec extends UInt48BECodec {
	_encode(value: number, buffer: Uint8Array, c: Context): void {
		buffer[c.offset++] = value & 0xff;
		buffer[c.offset++] = (value >>> 8) & 0xff;
		buffer[c.offset++] = (value >>> 16) & 0xff;
		buffer[c.offset++] = (value >>> 24) & 0xff;
		buffer[c.offset++] = (value / 2 ** 32) & 0xff;
		buffer[c.offset++] = value / 2 ** 40;
	}

	_decode(buffer: Uint8Array, c: Context): number {
		if (buffer.byteLength < c.offset + 6) throw new BufferfyByteLengthError();

		return buffer[c.offset++] + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++] * 2 ** 16 + buffer[c.offset++] * 2 ** 24 + buffer[c.offset++] * 2 ** 32 + buffer[c.offset++] * 2 ** 40;
	}
}

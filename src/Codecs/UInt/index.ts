import { endianness as osEndianness } from "os";
import { Context } from "../../utilities/Context";
import { AbstractCodec } from "../Abstract";
import { DecodeTransform } from "../Abstract/DecodeTransform";

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
	_bufferMap: Record<number, Buffer> = {};

	constructor() {
		super();

		for (let i = 0; i < 256; i++) this._bufferMap[i] = Buffer.from([i]);
	}

	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 256;
	}

	byteLength(_: number): 1 {
		return 1;
	}

	_encode(value: number, buffer: Buffer, c: Context): void {
		buffer[c.offset++] = value;
	}

	_decode(buffer: Buffer, c: Context): number {
		return buffer[c.offset++];
	}

	async _decodeChunks(transform: DecodeTransform): Promise<number> {
		const buffer = await transform._consume(1);

		return buffer[0];
	}
}

export class UInt16BECodec extends AbstractCodec<number> {
	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 65536;
	}

	byteLength(_: number): 2 {
		return 2;
	}

	_encode(value: number, buffer: Buffer, c: Context): void {
		buffer[c.offset++] = value >>> 8;
		buffer[c.offset++] = value & 0xff;
	}

	_decode(buffer: Buffer, c: Context): number {
		return buffer[c.offset++] * 2 ** 8 + buffer[c.offset++];
	}

	async _decodeChunks(transform: DecodeTransform): Promise<number> {
		const buffer = await transform._consume(2);

		return buffer[0] * 2 ** 8 + buffer[1];
	}
}

export class UInt16LECodec extends UInt16BECodec {
	_encode(value: number, buffer: Buffer, c: Context): void {
		buffer[c.offset++] = value & 0xff;
		buffer[c.offset++] = value >>> 8;
	}

	_decode(buffer: Buffer, c: Context): number {
		return buffer[c.offset++] + buffer[c.offset++] * 2 ** 8;
	}

	async _decodeChunks(transform: DecodeTransform): Promise<number> {
		const buffer = await transform._consume(2);

		return buffer[0] + buffer[1] * 2 ** 8;
	}
}

export class UInt24BECodec extends AbstractCodec<number> {
	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 16777216;
	}

	byteLength(_: number): 3 {
		return 3;
	}

	_encode(value: number, buffer: Buffer, c: Context): void {
		buffer[c.offset++] = value >>> 16;
		buffer[c.offset++] = (value >>> 8) & 0xff;
		buffer[c.offset++] = value & 0xff;
	}

	_decode(buffer: Buffer, c: Context): number {
		return buffer[c.offset++] * 2 ** 16 + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++];
	}

	async _decodeChunks(transform: DecodeTransform): Promise<number> {
		const buffer = await transform._consume(3);

		return buffer[0] * 2 ** 16 + buffer[1] * 2 ** 8 + buffer[2];
	}
}

export class UInt24LECodec extends UInt24BECodec {
	_encode(value: number, buffer: Buffer, c: Context): void {
		buffer[c.offset++] = value & 0xff;
		buffer[c.offset++] = (value >>> 8) & 0xff;
		buffer[c.offset++] = value >>> 16;
	}

	_decode(buffer: Buffer, c: Context): number {
		return buffer[c.offset++] + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++] * 2 ** 16;
	}

	async _decodeChunks(transform: DecodeTransform): Promise<number> {
		const buffer = await transform._consume(3);

		return buffer[0] + buffer[1] * 2 ** 8 + buffer[2] * 2 ** 16;
	}
}

export class UInt32BECodec extends AbstractCodec<number> {
	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 4294967296;
	}

	byteLength(_: number): 4 {
		return 4;
	}

	_encode(value: number, buffer: Buffer, c: Context): void {
		buffer[c.offset++] = value >>> 24;
		buffer[c.offset++] = (value >>> 16) & 0xff;
		buffer[c.offset++] = (value >>> 8) & 0xff;
		buffer[c.offset++] = value & 0xff;
	}

	_decode(buffer: Buffer, c: Context): number {
		return buffer[c.offset++] * 2 ** 24 + buffer[c.offset++] * 2 ** 16 + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++];
	}

	async _decodeChunks(transform: DecodeTransform): Promise<number> {
		const buffer = await transform._consume(4);

		return buffer[0] * 2 ** 24 + buffer[1] * 2 ** 16 + buffer[2] * 2 ** 8 + buffer[3];
	}
}

export class UInt32LECodec extends UInt32BECodec {
	_encode(value: number, buffer: Buffer, c: Context): void {
		buffer[c.offset++] = value >>> 24;
		buffer[c.offset++] = (value >>> 16) & 0xff;
		buffer[c.offset++] = (value >>> 8) & 0xff;
		buffer[c.offset++] = value & 0xff;
	}

	_decode(buffer: Buffer, c: Context): number {
		return buffer[c.offset++] * 2 ** 24 + buffer[c.offset++] * 2 ** 16 + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++];
	}

	async _decodeChunks(transform: DecodeTransform): Promise<number> {
		const buffer = await transform._consume(4);

		return buffer[0] * 2 ** 24 + buffer[1] * 2 ** 16 + buffer[2] * 2 ** 8 + buffer[3];
	}
}

export class UInt40BECodec extends AbstractCodec<number> {
	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 1099511627776;
	}

	byteLength(_: number): 5 {
		return 5;
	}

	_encode(value: number, buffer: Buffer, c: Context): void {
		buffer[c.offset++] = value / 2 ** 32;
		buffer[c.offset++] = (value >>> 24) & 0xff;
		buffer[c.offset++] = (value >>> 16) & 0xff;
		buffer[c.offset++] = (value >>> 8) & 0xff;
		buffer[c.offset++] = value & 0xff;
	}

	_decode(buffer: Buffer, c: Context): number {
		return buffer[c.offset++] * 2 ** 32 + buffer[c.offset++] * 2 ** 24 + buffer[c.offset++] * 2 ** 16 + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++];
	}

	async _decodeChunks(transform: DecodeTransform): Promise<number> {
		const buffer = await transform._consume(5);

		return buffer[0] * 2 ** 32 + buffer[1] * 2 ** 24 + buffer[2] * 2 ** 16 + buffer[3] * 2 ** 8 + buffer[4];
	}
}

export class UInt40LECodec extends UInt40BECodec {
	_encode(value: number, buffer: Buffer, c: Context): void {
		buffer[c.offset++] = value & 0xff;
		buffer[c.offset++] = (value >>> 8) & 0xff;
		buffer[c.offset++] = (value >>> 16) & 0xff;
		buffer[c.offset++] = (value >>> 24) & 0xff;
		buffer[c.offset++] = value / 2 ** 32;
	}

	_decode(buffer: Buffer, c: Context): number {
		return buffer[c.offset++] + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++] * 2 ** 16 + buffer[c.offset++] * 2 ** 24 + buffer[c.offset++] * 2 ** 32;
	}

	async _decodeChunks(transform: DecodeTransform): Promise<number> {
		const buffer = await transform._consume(5);

		return buffer[0] + buffer[1] * 2 ** 8 + buffer[2] * 2 ** 16 + buffer[3] * 2 ** 24 + buffer[4] * 2 ** 32;
	}
}

export class UInt48BECodec extends AbstractCodec<number> {
	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 281474976710656;
	}

	byteLength(_: number): 6 {
		return 6;
	}

	_encode(value: number, buffer: Buffer, c: Context): void {
		buffer[c.offset++] = value / 2 ** 40;
		buffer[c.offset++] = (value / 2 ** 32) & 0xff;
		buffer[c.offset++] = (value >>> 24) & 0xff;
		buffer[c.offset++] = (value >>> 16) & 0xff;
		buffer[c.offset++] = (value >>> 8) & 0xff;
		buffer[c.offset++] = value & 0xff;
	}

	_decode(buffer: Buffer, c: Context): number {
		return buffer[c.offset++] * 2 ** 40 + buffer[c.offset++] * 2 ** 32 + buffer[c.offset++] * 2 ** 24 + buffer[c.offset++] * 2 ** 16 + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++];
	}

	async _decodeChunks(transform: DecodeTransform): Promise<number> {
		const buffer = await transform._consume(6);

		return buffer[0] * 2 ** 40 + buffer[1] * 2 ** 32 + buffer[2] * 2 ** 24 + buffer[3] * 2 ** 16 + buffer[4] * 2 ** 8 + buffer[5];
	}
}

export class UInt48LECodec extends UInt48BECodec {
	_encode(value: number, buffer: Buffer, c: Context): void {
		buffer[c.offset++] = value & 0xff;
		buffer[c.offset++] = (value >>> 8) & 0xff;
		buffer[c.offset++] = (value >>> 16) & 0xff;
		buffer[c.offset++] = (value >>> 24) & 0xff;
		buffer[c.offset++] = (value / 2 ** 32) & 0xff;
		buffer[c.offset++] = value / 2 ** 40;
	}

	_decode(buffer: Buffer, c: Context): number {
		return buffer[c.offset++] + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++] * 2 ** 16 + buffer[c.offset++] * 2 ** 24 + buffer[c.offset++] * 2 ** 32 + buffer[c.offset++] * 2 ** 40;
	}

	async _decodeChunks(transform: DecodeTransform): Promise<number> {
		const buffer = await transform._consume(6);

		return buffer[0] + buffer[1] * 2 ** 8 + buffer[2] * 2 ** 16 + buffer[3] * 2 ** 24 + buffer[4] * 2 ** 32 + buffer[5] * 2 ** 40;
	}
}

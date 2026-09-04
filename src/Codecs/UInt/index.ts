import { NUMBER_MATCHER, type CodecMatcher } from "../../utilities/matcher";
import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";
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

export type UIntCodec = UInt8Codec | UInt16Codec | UInt24Codec | UInt32Codec | UInt40Codec | UInt48Codec;

/**
 * Creates a codec for a unsigned integer.
 *
 * Serializes to ```[UINT]```
 *
 * @param	{8 | 16 | 24 | 32 | 40 | 48} [bits=48] - Bit type of integer.
 * @param	{'LE' | 'BE'} [endianness='BE'] - Endianness
 * @return	{UIntCodec} UIntCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/UInt/index.ts|Source}
 */
export const createUIntCodec = (bits: UIntBits = 48, endianness: Endianness = "BE"): UIntCodec => {
	switch (bits) {
		case 8:
			return new UInt8Codec();
		case 16:
			return new UInt16Codec(endianness);
		case 24:
			return new UInt24Codec(endianness);
		case 32:
			return new UInt32Codec(endianness);
		case 40:
			return new UInt40Codec(endianness);
		case 48:
			return new UInt48Codec(endianness);
	}
};

export class UInt8Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 1;

	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 256;
	}

	override get matcher(): CodecMatcher {
		return NUMBER_MATCHER;
	}

	byteLength(): 1 {
		return UInt8Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		writer.writeByte(value);
	}

	_decode(reader: Reader): number {
		return reader.readByte();
	}
}

export class UInt16Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 2;

	private readonly _littleEndian: boolean;

	constructor(endianness: Endianness = "BE") {
		super();

		this._littleEndian = endianness === "LE";
	}

	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 65536;
	}

	override get matcher(): CodecMatcher {
		return NUMBER_MATCHER;
	}

	byteLength(): 2 {
		return UInt16Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		const offset = writer.reserve(2);

		writer.currentView.setUint16(offset, value, this._littleEndian);
	}

	_decode(reader: Reader): number {
		const offset = reader.skipBytes(2);

		return reader.view.getUint16(offset, this._littleEndian);
	}
}

export class UInt24Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 3;

	private readonly _littleEndian: boolean;

	constructor(endianness: Endianness = "BE") {
		super();

		this._littleEndian = endianness === "LE";
	}

	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 16777216;
	}

	override get matcher(): CodecMatcher {
		return NUMBER_MATCHER;
	}

	byteLength(): 3 {
		return UInt24Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		const offset = writer.reserve(3);
		const view = writer.currentView;

		const high = value >>> 8;
		const low = value & 0xff;

		if (this._littleEndian) {
			view.setUint8(offset, low);
			view.setUint16(offset + 1, high, true);
		} else {
			view.setUint16(offset, high, false);
			view.setUint8(offset + 2, low);
		}
	}

	_decode(reader: Reader): number {
		const offset = reader.skipBytes(3);
		const view = reader.view;

		let high: number;
		let low: number;

		if (this._littleEndian) {
			low = view.getUint8(offset);
			high = view.getUint16(offset + 1, true);
		} else {
			high = view.getUint16(offset, false);
			low = view.getUint8(offset + 2);
		}

		return (high << 8) | low;
	}
}

export class UInt32Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 4;

	private readonly _littleEndian: boolean;

	constructor(endianness: Endianness = "BE") {
		super();

		this._littleEndian = endianness === "LE";
	}

	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 4294967296;
	}

	override get matcher(): CodecMatcher {
		return NUMBER_MATCHER;
	}

	byteLength(): 4 {
		return UInt32Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		const offset = writer.reserve(4);

		writer.currentView.setUint32(offset, value, this._littleEndian);
	}

	_decode(reader: Reader): number {
		const offset = reader.skipBytes(4);

		return reader.view.getUint32(offset, this._littleEndian);
	}
}

export class UInt40Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 5;

	private readonly _littleEndian: boolean;

	constructor(endianness: Endianness = "BE") {
		super();

		this._littleEndian = endianness === "LE";
	}

	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 1099511627776;
	}

	override get matcher(): CodecMatcher {
		return NUMBER_MATCHER;
	}

	byteLength(): 5 {
		return UInt40Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		const offset = writer.reserve(5);
		const view = writer.currentView;

		const high = Math.floor(value / 0x100000000);
		const low = value % 0x100000000;

		if (this._littleEndian) {
			view.setUint32(offset, low, true);
			view.setUint8(offset + 4, high);
		} else {
			view.setUint8(offset, high);
			view.setUint32(offset + 1, low, false);
		}
	}

	_decode(reader: Reader): number {
		const offset = reader.skipBytes(5);
		const view = reader.view;

		let high: number;
		let low: number;

		if (this._littleEndian) {
			low = view.getUint32(offset, true);
			high = view.getUint8(offset + 4);
		} else {
			high = view.getUint8(offset);
			low = view.getUint32(offset + 1, false);
		}

		return high * 0x100000000 + low;
	}
}

export class UInt48Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 6;

	private readonly _littleEndian: boolean;

	constructor(endianness: Endianness = "BE") {
		super();

		this._littleEndian = endianness === "LE";
	}

	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 281474976710656;
	}

	override get matcher(): CodecMatcher {
		return NUMBER_MATCHER;
	}

	byteLength(): 6 {
		return UInt48Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		const offset = writer.reserve(6);
		const view = writer.currentView;

		const high = Math.floor(value / 0x100000000);
		const low = value % 0x100000000;

		if (this._littleEndian) {
			view.setUint32(offset, low, true);
			view.setUint16(offset + 4, high, true);
		} else {
			view.setUint16(offset, high, false);
			view.setUint32(offset + 2, low, false);
		}
	}

	_decode(reader: Reader): number {
		const offset = reader.skipBytes(6);
		const view = reader.view;

		let high: number;
		let low: number;

		if (this._littleEndian) {
			low = view.getUint32(offset, true);
			high = view.getUint16(offset + 4, true);
		} else {
			high = view.getUint16(offset, false);
			low = view.getUint32(offset + 2, false);
		}

		return high * 0x100000000 + low;
	}
}

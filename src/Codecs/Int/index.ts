import { NUMBER_MATCHER, type CodecMatcher } from "../../utilities/matcher";
import { AbstractCodec } from "../Abstract";
import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";
import type { Endianness, UIntBits } from "../UInt";

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
 * @return	{IntCodec} IntCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Int/index.ts|Source}
 */
export const createIntCodec = (bits: UIntBits = 48, endianness: Endianness = "BE"): IntCodec => {
	switch (bits) {
		case 8:
			return new Int8Codec();
		case 16:
			return new Int16Codec(bits, endianness);
		case 24:
			return new Int24Codec(bits, endianness);
		case 32:
			return new Int32Codec(bits, endianness);
		case 40:
			return new Int40Codec(bits, endianness);
		case 48:
			return new Int48Codec(bits, endianness);
	}
};

export class Int8Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 1;
	static readonly OFFSET = 128;
	static readonly MIN_VALUE = -128;
	static readonly MAX_VALUE = 127;

	isValid(value: unknown): value is number {
		return (
			typeof value === "number" &&
			Number.isInteger(value) &&
			value >= Int8Codec.MIN_VALUE &&
			value <= Int8Codec.MAX_VALUE
		);
	}

	override get matcher(): CodecMatcher {
		return NUMBER_MATCHER;
	}

	byteLength(): 1 {
		return Int8Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		writer.writeByte(value + Int8Codec.OFFSET);
	}

	_decode(reader: Reader): number {
		return reader.readByte() - Int8Codec.OFFSET;
	}
}

export class Int16Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 2;
	static readonly OFFSET = 32768;
	static readonly MIN_VALUE = -32768;
	static readonly MAX_VALUE = 32767;

	private readonly _littleEndian: boolean;

	constructor(_bits: Extract<UIntBits, 16>, endianness: Endianness = "BE") {
		super();

		this._littleEndian = endianness === "LE";
	}

	isValid(value: unknown): value is number {
		return (
			typeof value === "number" &&
			Number.isInteger(value) &&
			value >= Int16Codec.MIN_VALUE &&
			value <= Int16Codec.MAX_VALUE
		);
	}

	override get matcher(): CodecMatcher {
		return NUMBER_MATCHER;
	}

	byteLength(): 2 {
		return Int16Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		const offset = writer.reserve(2);

		writer.currentView.setUint16(offset, value + Int16Codec.OFFSET, this._littleEndian);
	}

	_decode(reader: Reader): number {
		const offset = reader.skipBytes(2);

		return reader.view.getUint16(offset, this._littleEndian) - Int16Codec.OFFSET;
	}
}

export class Int24Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 3;
	static readonly OFFSET = 8388608;
	static readonly MIN_VALUE = -8388608;
	static readonly MAX_VALUE = 8388607;

	private readonly _littleEndian: boolean;

	constructor(_bits: Extract<UIntBits, 24>, endianness: Endianness = "BE") {
		super();

		this._littleEndian = endianness === "LE";
	}

	isValid(value: unknown): value is number {
		return (
			typeof value === "number" &&
			Number.isInteger(value) &&
			value >= Int24Codec.MIN_VALUE &&
			value <= Int24Codec.MAX_VALUE
		);
	}

	override get matcher(): CodecMatcher {
		return NUMBER_MATCHER;
	}

	byteLength(): 3 {
		return Int24Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		const offset = writer.reserve(3);
		const view = writer.currentView;

		const unsigned = value + Int24Codec.OFFSET;
		const high = unsigned >>> 8;
		const low = unsigned & 0xff;

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

		return ((high << 8) | low) - Int24Codec.OFFSET;
	}
}

export class Int32Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 4;
	static readonly OFFSET = 2147483648;
	static readonly MIN_VALUE = -2147483648;
	static readonly MAX_VALUE = 2147483647;

	private readonly _littleEndian: boolean;

	constructor(_bits: Extract<UIntBits, 32>, endianness: Endianness = "BE") {
		super();

		this._littleEndian = endianness === "LE";
	}

	isValid(value: unknown): value is number {
		return (
			typeof value === "number" &&
			Number.isInteger(value) &&
			value >= Int32Codec.MIN_VALUE &&
			value <= Int32Codec.MAX_VALUE
		);
	}

	override get matcher(): CodecMatcher {
		return NUMBER_MATCHER;
	}

	byteLength(): 4 {
		return Int32Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		const offset = writer.reserve(4);

		writer.currentView.setUint32(offset, value + Int32Codec.OFFSET, this._littleEndian);
	}

	_decode(reader: Reader): number {
		const offset = reader.skipBytes(4);

		return reader.view.getUint32(offset, this._littleEndian) - Int32Codec.OFFSET;
	}
}

export class Int40Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 5;
	static readonly OFFSET = 549755813888;
	static readonly MIN_VALUE = -549755813888;
	static readonly MAX_VALUE = 549755813887;

	private readonly _littleEndian: boolean;

	constructor(_bits: Extract<UIntBits, 40>, endianness: Endianness = "BE") {
		super();

		this._littleEndian = endianness === "LE";
	}

	isValid(value: unknown): value is number {
		return (
			typeof value === "number" &&
			Number.isInteger(value) &&
			value >= Int40Codec.MIN_VALUE &&
			value <= Int40Codec.MAX_VALUE
		);
	}

	override get matcher(): CodecMatcher {
		return NUMBER_MATCHER;
	}

	byteLength(): 5 {
		return Int40Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		const offset = writer.reserve(5);
		const view = writer.currentView;

		const unsigned = value + Int40Codec.OFFSET;
		const high = Math.floor(unsigned / 0x100000000);
		const low = unsigned % 0x100000000;

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

		return high * 0x100000000 + low - Int40Codec.OFFSET;
	}
}

export class Int48Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 6;
	static readonly OFFSET = 140737488355328;
	static readonly MIN_VALUE = -140737488355328;
	static readonly MAX_VALUE = 140737488355327;

	private readonly _littleEndian: boolean;

	constructor(_bits: Extract<UIntBits, 48>, endianness: Endianness = "BE") {
		super();

		this._littleEndian = endianness === "LE";
	}

	isValid(value: unknown): value is number {
		return (
			typeof value === "number" &&
			Number.isInteger(value) &&
			value >= Int48Codec.MIN_VALUE &&
			value <= Int48Codec.MAX_VALUE
		);
	}

	override get matcher(): CodecMatcher {
		return NUMBER_MATCHER;
	}

	byteLength(): 6 {
		return Int48Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		const offset = writer.reserve(6);
		const view = writer.currentView;

		const unsigned = value + Int48Codec.OFFSET;
		const high = Math.floor(unsigned / 0x100000000);
		const low = unsigned % 0x100000000;

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

		return high * 0x100000000 + low - Int48Codec.OFFSET;
	}
}

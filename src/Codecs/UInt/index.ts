import { NUMBER_MATCHER, type CodecMatcher } from "../../utilities/matcher";
import { readUInt24, readUInt40, readUInt48, writeUInt24, writeUInt40, writeUInt48 } from "../../utilities/splitWidth";
import { AbstractCodec } from "../Abstract";
import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";

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

abstract class EndianUIntCodec extends AbstractCodec<number> {
	protected readonly _littleEndian: boolean;

	constructor(
		private readonly _exclusiveMaximum: number,
		endianness: Endianness,
	) {
		super();

		this._littleEndian = endianness === "LE";
	}

	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < this._exclusiveMaximum;
	}

	override get matcher(): CodecMatcher {
		return NUMBER_MATCHER;
	}
}

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

export class UInt16Codec extends EndianUIntCodec {
	static readonly BYTE_LENGTH = 2;

	constructor(endianness: Endianness = "BE") {
		super(65536, endianness);
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

export class UInt24Codec extends EndianUIntCodec {
	static readonly BYTE_LENGTH = 3;

	constructor(endianness: Endianness = "BE") {
		super(16777216, endianness);
	}

	byteLength(): 3 {
		return UInt24Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		writeUInt24(value, writer, this._littleEndian);
	}

	_decode(reader: Reader): number {
		return readUInt24(reader, this._littleEndian);
	}
}

export class UInt32Codec extends EndianUIntCodec {
	static readonly BYTE_LENGTH = 4;

	constructor(endianness: Endianness = "BE") {
		super(4294967296, endianness);
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

export class UInt40Codec extends EndianUIntCodec {
	static readonly BYTE_LENGTH = 5;

	constructor(endianness: Endianness = "BE") {
		super(1099511627776, endianness);
	}

	byteLength(): 5 {
		return UInt40Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		writeUInt40(value, writer, this._littleEndian);
	}

	_decode(reader: Reader): number {
		return readUInt40(reader, this._littleEndian);
	}
}

export class UInt48Codec extends EndianUIntCodec {
	static readonly BYTE_LENGTH = 6;

	constructor(endianness: Endianness = "BE") {
		super(281474976710656, endianness);
	}

	byteLength(): 6 {
		return UInt48Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		writeUInt48(value, writer, this._littleEndian);
	}

	_decode(reader: Reader): number {
		return readUInt48(reader, this._littleEndian);
	}
}

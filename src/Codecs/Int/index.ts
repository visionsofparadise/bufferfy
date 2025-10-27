import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { type Endianness, type UIntBits, createUIntCodec } from "../UInt";

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

	private readonly uIntCodec = createUIntCodec(8);

	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= Int8Codec.MIN_VALUE && value <= Int8Codec.MAX_VALUE;
	}

	byteLength(): 1 {
		return Int8Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		this.uIntCodec._encode(value + Int8Codec.OFFSET, writer);
	}

	_decode(reader: Reader): number {
		return this.uIntCodec._decode(reader) - Int8Codec.OFFSET;
	}
}

export class Int16Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 2;
	static readonly OFFSET = 32768;
	static readonly MIN_VALUE = -32768;
	static readonly MAX_VALUE = 32767;

	private readonly uIntCodec: AbstractCodec<number>;

	constructor(bits: Extract<UIntBits, 16>, endianness: Endianness = "BE") {
		super();

		this.uIntCodec = createUIntCodec(bits, endianness);
	}

	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= Int16Codec.MIN_VALUE && value <= Int16Codec.MAX_VALUE;
	}

	byteLength(): 2 {
		return Int16Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		this.uIntCodec._encode(value + Int16Codec.OFFSET, writer);
	}

	_decode(reader: Reader): number {
		return this.uIntCodec._decode(reader) - Int16Codec.OFFSET;
	}
}

export class Int24Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 3;
	static readonly OFFSET = 8388608;
	static readonly MIN_VALUE = -8388608;
	static readonly MAX_VALUE = 8388607;

	private readonly uIntCodec: AbstractCodec<number>;

	constructor(bits: Extract<UIntBits, 24>, endianness: Endianness = "BE") {
		super();

		this.uIntCodec = createUIntCodec(bits, endianness);
	}

	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= Int24Codec.MIN_VALUE && value <= Int24Codec.MAX_VALUE;
	}

	byteLength(): 3 {
		return Int24Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		this.uIntCodec._encode(value + Int24Codec.OFFSET, writer);
	}

	_decode(reader: Reader): number {
		return this.uIntCodec._decode(reader) - Int24Codec.OFFSET;
	}
}

export class Int32Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 4;
	static readonly OFFSET = 2147483648;
	static readonly MIN_VALUE = -2147483648;
	static readonly MAX_VALUE = 2147483647;

	private readonly uIntCodec: AbstractCodec<number>;

	constructor(bits: Extract<UIntBits, 32>, endianness: Endianness = "BE") {
		super();

		this.uIntCodec = createUIntCodec(bits, endianness);
	}

	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= Int32Codec.MIN_VALUE && value <= Int32Codec.MAX_VALUE;
	}

	byteLength(): 4 {
		return Int32Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		this.uIntCodec._encode(value + Int32Codec.OFFSET, writer);
	}

	_decode(reader: Reader): number {
		return this.uIntCodec._decode(reader) - Int32Codec.OFFSET;
	}
}

export class Int40Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 5;
	static readonly OFFSET = 549755813888;
	static readonly MIN_VALUE = -549755813888;
	static readonly MAX_VALUE = 549755813887;

	private readonly uIntCodec: AbstractCodec<number>;

	constructor(bits: Extract<UIntBits, 40>, endianness: Endianness = "BE") {
		super();

		this.uIntCodec = createUIntCodec(bits, endianness);
	}

	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= Int40Codec.MIN_VALUE && value <= Int40Codec.MAX_VALUE;
	}

	byteLength(): 5 {
		return Int40Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		this.uIntCodec._encode(value + Int40Codec.OFFSET, writer);
	}

	_decode(reader: Reader): number {
		return this.uIntCodec._decode(reader) - Int40Codec.OFFSET;
	}
}

export class Int48Codec extends AbstractCodec<number> {
	static readonly BYTE_LENGTH = 6;
	static readonly OFFSET = 140737488355328;
	static readonly MIN_VALUE = -140737488355328;
	static readonly MAX_VALUE = 140737488355327;

	private readonly uIntCodec: AbstractCodec<number>;

	constructor(bits: Extract<UIntBits, 48>, endianness: Endianness = "BE") {
		super();

		this.uIntCodec = createUIntCodec(bits, endianness);
	}

	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= Int48Codec.MIN_VALUE && value <= Int48Codec.MAX_VALUE;
	}

	byteLength(): 6 {
		return Int48Codec.BYTE_LENGTH;
	}

	_encode(value: number, writer: Writer): void {
		this.uIntCodec._encode(value + Int48Codec.OFFSET, writer);
	}

	_decode(reader: Reader): number {
		return this.uIntCodec._decode(reader) - Int48Codec.OFFSET;
	}
}

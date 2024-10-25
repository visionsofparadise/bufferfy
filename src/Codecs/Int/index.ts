import { endianness as osEndianness } from "os";
import { Context } from "../../utilities/Context";
import {
	Endianness,
	UInt16BECodec,
	UInt16LECodec,
	UInt24BECodec,
	UInt24LECodec,
	UInt32BECodec,
	UInt32LECodec,
	UInt40BECodec,
	UInt40LECodec,
	UInt48BECodec,
	UInt48LECodec,
	UInt8Codec,
	UIntBits,
} from "../UInt";

export type IntCodec = Int8Codec | Int16BECodec | Int16LECodec | Int24BECodec | Int24LECodec | Int32BECodec | Int32LECodec | Int40BECodec | Int40LECodec | Int48BECodec | Int48LECodec;

/**
 * Creates a codec for a signed integer.
 *
 * Serializes to ```[INT]```
 *
 * @param	{8 | 16 | 24 | 32 | 40 | 48} [bits=48] - Bit type of integer.
 * @param	{'LE' | 'BE'} [endianness=os.endianness()] - Endianness
 * @return	{IntCodec} IntCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Int/index.ts|Source}
 */
export const createIntCodec = (bits: UIntBits = 48, endianness: Endianness = osEndianness()) => {
	if (bits === 8) return new Int8Codec();

	switch (endianness) {
		case "BE": {
			switch (bits) {
				case 16: {
					return new Int16BECodec();
				}
				case 24: {
					return new Int24BECodec();
				}
				case 32: {
					return new Int32BECodec();
				}
				case 40: {
					return new Int40BECodec();
				}
				case 48: {
					return new Int48BECodec();
				}
			}
		}
		case "LE": {
			switch (bits) {
				case 16: {
					return new Int16LECodec();
				}
				case 24: {
					return new Int24LECodec();
				}
				case 32: {
					return new Int32LECodec();
				}
				case 40: {
					return new Int40LECodec();
				}
				case 48: {
					return new Int48LECodec();
				}
			}
		}
	}
};

export class Int8Codec extends UInt8Codec {
	isValid(value: any): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= -127 && value <= 127;
	}

	_encode(value: number, buffer: Buffer, c: Context): void {
		super._encode(value + 127, buffer, c);
	}

	_decode(buffer: Buffer, c: Context): number {
		return super._decode(buffer, c) - 127;
	}
}

export class Int16BECodec extends UInt16BECodec {
	isValid(value: any): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= -32767 && value <= 32767;
	}

	_encode(value: number, buffer: Buffer, c: Context): void {
		super._encode(value + 32767, buffer, c);
	}

	_decode(buffer: Buffer, c: Context): number {
		return super._decode(buffer, c) - 32767;
	}
}

export class Int16LECodec extends UInt16LECodec {
	isValid(value: any): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= -32767 && value <= 32767;
	}

	_encode(value: number, buffer: Buffer, c: Context): void {
		super._encode(value + 32767, buffer, c);
	}

	_decode(buffer: Buffer, c: Context): number {
		return super._decode(buffer, c) - 32767;
	}
}

export class Int24BECodec extends UInt24BECodec {
	isValid(value: any): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= -8388607 && value <= 8388607;
	}

	_encode(value: number, buffer: Buffer, c: Context): void {
		super._encode(value + 8388607, buffer, c);
	}

	_decode(buffer: Buffer, c: Context): number {
		return super._decode(buffer, c) - 8388607;
	}
}

export class Int24LECodec extends UInt24LECodec {
	isValid(value: any): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= -8388607 && value <= 8388607;
	}

	_encode(value: number, buffer: Buffer, c: Context): void {
		super._encode(value + 8388607, buffer, c);
	}

	_decode(buffer: Buffer, c: Context): number {
		return super._decode(buffer, c) - 8388607;
	}
}

export class Int32BECodec extends UInt32BECodec {
	isValid(value: any): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= -2147483647 && value <= 2147483647;
	}

	_encode(value: number, buffer: Buffer, c: Context): void {
		super._encode(value + 2147483647, buffer, c);
	}

	_decode(buffer: Buffer, c: Context): number {
		return super._decode(buffer, c) - 2147483647;
	}
}

export class Int32LECodec extends UInt32LECodec {
	isValid(value: any): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= -2147483647 && value <= 2147483647;
	}

	_encode(value: number, buffer: Buffer, c: Context): void {
		super._encode(value + 2147483647, buffer, c);
	}

	_decode(buffer: Buffer, c: Context): number {
		return super._decode(buffer, c) - 2147483647;
	}
}

export class Int40BECodec extends UInt40BECodec {
	isValid(value: any): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= -549755813887 && value <= 549755813887;
	}

	_encode(value: number, buffer: Buffer, c: Context): void {
		super._encode(value + 549755813887, buffer, c);
	}

	_decode(buffer: Buffer, c: Context): number {
		return super._decode(buffer, c) - 549755813887;
	}
}

export class Int40LECodec extends UInt40LECodec {
	isValid(value: any): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= -549755813887 && value <= 549755813887;
	}

	_encode(value: number, buffer: Buffer, c: Context): void {
		super._encode(value + 549755813887, buffer, c);
	}

	_decode(buffer: Buffer, c: Context): number {
		return super._decode(buffer, c) - 549755813887;
	}
}

export class Int48BECodec extends UInt48BECodec {
	isValid(value: any): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= -140737488355327 && value <= 140737488355327;
	}

	_encode(value: number, buffer: Buffer, c: Context): void {
		super._encode(value + 140737488355327, buffer, c);
	}

	_decode(buffer: Buffer, c: Context): number {
		return super._decode(buffer, c) - 140737488355327;
	}
}

export class Int48LECodec extends UInt48LECodec {
	isValid(value: any): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= -140737488355327 && value <= 140737488355327;
	}

	_encode(value: number, buffer: Buffer, c: Context): void {
		super._encode(value + 140737488355327, buffer, c);
	}

	_decode(buffer: Buffer, c: Context): number {
		return super._decode(buffer, c) - 140737488355327;
	}
}

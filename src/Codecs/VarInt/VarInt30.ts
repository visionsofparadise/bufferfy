import { Context } from "../../utilities/Context";
import { BufferfyByteLengthError } from "../../utilities/Error";
import { AbstractCodec } from "../Abstract";

export class VarInt30Codec extends AbstractCodec<number> {
	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 1073741824;
	}

	byteLength(value: number): 1 | 2 | 3 | 4 {
		return value < 64 ? 1 : value < 16384 ? 2 : value < 4194304 ? 3 : 4;
	}

	_encode(value: number, buffer: Uint8Array, c: Context): void {
		const byteLength = this.byteLength(value);

		switch (byteLength) {
			case 1: {
				buffer[c.offset++] = value;

				return;
			}
			case 2: {
				buffer[c.offset++] = (value >>> 8) | 0x40;
				buffer[c.offset++] = value & 0xff;

				return;
			}
			case 3: {
				buffer[c.offset++] = (value >>> 16) | 0x80;
				buffer[c.offset++] = (value >>> 8) & 0xff;
				buffer[c.offset++] = value & 0xff;

				return;
			}
			case 4: {
				buffer[c.offset++] = (value >>> 24) | 0xc0;
				buffer[c.offset++] = (value >>> 16) & 0xff;
				buffer[c.offset++] = (value >>> 8) & 0xff;
				buffer[c.offset++] = value & 0xff;

				return;
			}
		}
	}

	_decode(buffer: Uint8Array, c: Context): number {
		if (buffer.byteLength < c.offset + 1) throw new BufferfyByteLengthError();

		const byte0 = buffer[c.offset++];
		const lengthBits = (0xc0 & byte0) as 0x00 | 0x40 | 0x80 | 0xc0;

		const remainingByteLength = (lengthBits / 64) as 0 | 1 | 2 | 3;

		if (buffer.byteLength < c.offset + remainingByteLength) throw new BufferfyByteLengthError();

		switch (remainingByteLength) {
			case 0: {
				return byte0;
			}
			case 1: {
				return (0x3f & byte0) * 2 ** 8 + buffer[c.offset++];
			}
			case 2: {
				return (0x3f & byte0) * 2 ** 16 + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++];
			}
			case 3: {
				return (0x3f & byte0) * 2 ** 24 + buffer[c.offset++] * 2 ** 16 + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++];
			}
		}
	}
}

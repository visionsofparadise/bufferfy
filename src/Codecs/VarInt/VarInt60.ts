import { Context } from "../../utilities/Context";
import { BufferfyByteLengthError } from "../../utilities/Error";
import { AbstractCodec } from "../Abstract";

export class VarInt60Codec extends AbstractCodec<number> {
	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 281474976710656;
	}

	byteLength(value: number): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
		return value < 32 ? 1 : value < 8192 ? 2 : value < 2097152 ? 3 : value < 536870912 ? 4 : value < 137438953472 ? 5 : value < 35184372088832 ? 6 : 7;
	}

	_encode(value: number, buffer: Uint8Array, c: Context): void {
		let byteLength = this.byteLength(value);

		switch (byteLength) {
			case 1: {
				buffer[c.offset++] = value;

				return;
			}
			case 2: {
				buffer[c.offset++] = (value >>> 8) | 0x20;
				buffer[c.offset++] = value & 0xff;

				return;
			}
			case 3: {
				buffer[c.offset++] = (value >>> 16) | 0x40;
				buffer[c.offset++] = (value >>> 8) & 0xff;
				buffer[c.offset++] = value & 0xff;

				return;
			}
			case 4: {
				buffer[c.offset++] = (value >>> 24) | 0x60;
				buffer[c.offset++] = (value >>> 16) & 0xff;
				buffer[c.offset++] = (value >>> 8) & 0xff;
				buffer[c.offset++] = value & 0xff;

				return;
			}
			case 5: {
				buffer[c.offset++] = (value / 2 ** 32) | 0x80;
				buffer[c.offset++] = (value >>> 24) & 0xff;
				buffer[c.offset++] = (value >>> 16) & 0xff;
				buffer[c.offset++] = (value >>> 8) & 0xff;
				buffer[c.offset++] = value & 0xff;

				return;
			}
			case 6: {
				buffer[c.offset++] = (value / 2 ** 40) | 0xa0;
				buffer[c.offset++] = (value / 2 ** 32) & 0xff;
				buffer[c.offset++] = (value >>> 24) & 0xff;
				buffer[c.offset++] = (value >>> 16) & 0xff;
				buffer[c.offset++] = (value >>> 8) & 0xff;
				buffer[c.offset++] = value & 0xff;

				return;
			}
			case 7: {
				buffer[c.offset++] = (value / 2 ** 48) | 0xc0;
				buffer[c.offset++] = (value / 2 ** 40) & 0xff;
				buffer[c.offset++] = (value / 2 ** 32) & 0xff;
				buffer[c.offset++] = (value >>> 24) & 0xff;
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
		const lengthBits = (0xe0 & byte0) as 0x00 | 0x20 | 0x40 | 0x60 | 0x80 | 0xa0 | 0xc0;

		const remainingByteLength = (lengthBits / 32) as 0 | 1 | 2 | 3 | 4 | 5 | 6;

		if (buffer.byteLength < c.offset + remainingByteLength) throw new BufferfyByteLengthError();

		switch (remainingByteLength) {
			case 0: {
				return byte0;
			}
			case 1: {
				return (0x1f & byte0) * 2 ** 8 + buffer[c.offset++];
			}
			case 2: {
				return (0x1f & byte0) * 2 ** 16 + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++];
			}
			case 3: {
				return (0x1f & byte0) * 2 ** 24 + buffer[c.offset++] * 2 ** 16 + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++];
			}
			case 4: {
				return (0x1f & byte0) * 2 ** 32 + buffer[c.offset++] * 2 ** 24 + buffer[c.offset++] * 2 ** 16 + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++];
			}
			case 5: {
				return (0x1f & byte0) * 2 ** 40 + buffer[c.offset++] * 2 ** 32 + buffer[c.offset++] * 2 ** 24 + buffer[c.offset++] * 2 ** 16 + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++];
			}
			case 6: {
				return (
					(0x1f & byte0) * 2 ** 48 +
					buffer[c.offset++] * 2 ** 40 +
					buffer[c.offset++] * 2 ** 32 +
					buffer[c.offset++] * 2 ** 24 +
					buffer[c.offset++] * 2 ** 16 +
					buffer[c.offset++] * 2 ** 8 +
					buffer[c.offset++]
				);
			}
		}
	}
}

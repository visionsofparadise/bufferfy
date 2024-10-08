import { Context } from "../../utilities/Context";
import { AbstractCodec } from "../Abstract";
import { DecodeTransform } from "../Abstract/DecodeTransform";

export class VarInt30Codec extends AbstractCodec<number> {
	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 1073741824;
	}

	byteLength(value: number): 1 | 2 | 3 | 4 {
		return value < 64 ? 1 : value < 16384 ? 2 : value < 4194304 ? 3 : 4;
	}

	_encode(value: number, buffer: Buffer, c: Context): void {
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

	_decode(buffer: Buffer, c: Context): number {
		const byte0 = buffer[c.offset++];
		const lengthBits = (0xc0 & byte0) as 0x00 | 0x40 | 0x80 | 0xc0;

		switch (lengthBits) {
			case 0x00: {
				return byte0;
			}
			case 0x40: {
				return (0x3f & byte0) * 2 ** 8 + buffer[c.offset++];
			}
			case 0x80: {
				return (0x3f & byte0) * 2 ** 16 + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++];
			}
			case 0xc0: {
				return (0x3f & byte0) * 2 ** 24 + buffer[c.offset++] * 2 ** 16 + buffer[c.offset++] * 2 ** 8 + buffer[c.offset++];
			}
		}
	}

	async _decodeChunks(transform: DecodeTransform): Promise<number> {
		const lengthBuffer = await transform.consume(1);

		const byte0 = lengthBuffer[0];
		const lengthBits = (0xc0 & byte0) as 0x00 | 0x40 | 0x80 | 0xc0;

		switch (lengthBits) {
			case 0x00: {
				return byte0;
			}
			case 0x40: {
				const restBuffer = await transform.consume(1);

				return (0x3f & byte0) * 2 ** 8 + restBuffer[0];
			}
			case 0x80: {
				const restBuffer = await transform.consume(2);

				return (0x3f & byte0) * 2 ** 16 + restBuffer[0] * 2 ** 8 + restBuffer[1];
			}
			case 0xc0: {
				const restBuffer = await transform.consume(3);

				return (0x3f & byte0) * 2 ** 24 + restBuffer[0] * 2 ** 16 + restBuffer[1] * 2 ** 8 + restBuffer[2];
			}
		}
	}
}

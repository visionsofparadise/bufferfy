import { Context } from "../../utilities/Context";
import { AbstractCodec } from "../Abstract";
import { DecodeTransform } from "../Abstract/DecodeTransform";

export class VarInt15Codec extends AbstractCodec<number> {
	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 32768;
	}

	byteLength(value: number): 1 | 2 {
		return value < 128 ? 1 : 2;
	}

	_encode(value: number, buffer: Buffer, c: Context): void {
		const byteLength = this.byteLength(value);

		switch (byteLength) {
			case 1: {
				buffer[c.offset++] = value;

				return;
			}
			case 2: {
				buffer[c.offset++] = (value >>> 8) | 0x80;
				buffer[c.offset++] = value & 0xff;

				return;
			}
		}
	}

	_decode(buffer: Buffer, c: Context): number {
		const byte0 = buffer[c.offset++];
		const lengthBits = (0x80 & byte0) as 0x00 | 0x80;

		switch (lengthBits) {
			case 0x00: {
				return byte0;
			}
			case 0x80: {
				return (0x7f & byte0) * 2 ** 8 + buffer[c.offset++];
			}
		}
	}

	async _decodeChunks(transform: DecodeTransform): Promise<number> {
		const lengthBuffer = await transform._consume(1);

		const byte0 = lengthBuffer[0];
		const lengthBits = (0x80 & byte0) as 0x00 | 0x80;

		switch (lengthBits) {
			case 0x00: {
				return byte0;
			}
			case 0x80: {
				const restBuffer = await transform._consume(1);

				return (0x7f & byte0) * 2 ** 8 + restBuffer[0];
			}
		}
	}
}

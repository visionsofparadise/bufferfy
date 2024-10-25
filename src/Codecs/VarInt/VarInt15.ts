import { Context } from "../../utilities/Context";
import { BufferfyByteLengthError } from "../../utilities/Error";
import { AbstractCodec } from "../Abstract";

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
		if (buffer.byteLength < c.offset + 1) throw new BufferfyByteLengthError();

		const byte0 = buffer[c.offset++];
		const lengthBits = (0x80 & byte0) as 0x00 | 0x80;

		const remainingByteLength = (lengthBits / 128) as 0 | 1;

		if (buffer.byteLength < c.offset + remainingByteLength) throw new BufferfyByteLengthError();

		switch (remainingByteLength) {
			case 0: {
				return byte0;
			}
			case 1: {
				return (0x7f & byte0) * 2 ** 8 + buffer[c.offset++];
			}
		}
	}
}

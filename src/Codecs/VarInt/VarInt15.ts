import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";

const MAX_VARINT15 = 32768; // 2^15

export class VarInt15Codec extends AbstractCodec<number> {
	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < MAX_VARINT15;
	}

	byteLength(value: number): 1 | 2 {
		return value < 128 ? 1 : 2;
	}

	_encode(value: number, writer: Writer): void {
		if (value < 128) {
			writer.writeByte(value);
			return;
		}

		// High bit indicates 2-byte encoding, low 7 bits store high value bits
		writer.writeByte((value >>> 8) | 0x80);
		writer.writeByte(value & 0xff);
	}

	_decode(reader: Reader): number {
		const firstByte = reader.readByte();

		// Check high bit
		if ((firstByte & 0x80) === 0) {
			return firstByte;
		}

		// Two-byte value: low 7 bits of first byte + second byte
		const highBits = (firstByte & 0x7f) << 8;
		const lowBits = reader.readByte();

		return highBits + lowBits;
	}
}

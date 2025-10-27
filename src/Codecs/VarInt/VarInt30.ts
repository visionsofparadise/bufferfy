import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";

const MAX_VARINT30 = 1073741824; // 2^30
const VARINT30_THRESHOLDS = [64, 16384, 4194304];

export class VarInt30Codec extends AbstractCodec<number> {
	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < MAX_VARINT30;
	}

	byteLength(value: number): 1 | 2 | 3 | 4 {
		for (let i = 0; i < VARINT30_THRESHOLDS.length; i++) {
			if (value < VARINT30_THRESHOLDS[i]) return (i + 1) as 1 | 2 | 3 | 4;
		}
		return 4;
	}

	_encode(value: number, writer: Writer): void {
		const byteLength = this.byteLength(value);

		if (byteLength === 1) {
			writer.writeByte(value);
			return;
		}

		// First byte: high 2 bits encode remaining byte count, low 6 bits store high value bits
		const remainingBytes = byteLength - 1;
		const lengthPrefix = remainingBytes << 6; // Shift to high 2 bits
		const shiftBits = remainingBytes * 8;
		const highBits = (value >>> shiftBits) & 0x3f;

		writer.writeByte(lengthPrefix | highBits);

		// Write remaining bytes from high to low
		for (let i = remainingBytes - 1; i >= 0; i--) {
			writer.writeByte((value >>> (i * 8)) & 0xff);
		}
	}

	_decode(reader: Reader): number {
		const firstByte = reader.readByte();

		// Extract length from high 2 bits
		const lengthBits = firstByte & 0xc0;
		const remainingBytes = lengthBits / 64;

		if (remainingBytes === 0) {
			return firstByte;
		}

		// Extract value from low 6 bits
		let value = (firstByte & 0x3f) << (remainingBytes * 8);

		// Read remaining bytes
		for (let i = remainingBytes - 1; i >= 0; i--) {
			const byte = reader.readByte();
			value += byte << (i * 8);
		}

		return value;
	}
}

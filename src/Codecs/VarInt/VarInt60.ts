import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";

const MAX_SAFE_VARINT60 = 281474976710656; // 2^48
const VARINT60_THRESHOLDS = [32, 8192, 2097152, 536870912, 137438953472, 35184372088832];

export class VarInt60Codec extends AbstractCodec<number> {
	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < MAX_SAFE_VARINT60 && value <= Number.MAX_SAFE_INTEGER;
	}

	byteLength(value: number): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
		for (let i = 0; i < VARINT60_THRESHOLDS.length; i++) {
			if (value < VARINT60_THRESHOLDS[i]) return (i + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
		}
		return 7;
	}

	_encode(value: number, writer: Writer): void {
		const byteLength = this.byteLength(value);

		if (byteLength === 1) {
			writer.writeByte(value);
			return;
		}

		// First byte: high 3 bits encode remaining byte count, low 5 bits store high value bits
		const remainingBytes = byteLength - 1;
		const lengthPrefix = remainingBytes << 5; // Shift to high 3 bits
		const shiftBits = remainingBytes * 8;
		const highBits = Math.floor(value / Math.pow(2, shiftBits)) & 0x1f;

		writer.writeByte(lengthPrefix | highBits);

		// Write remaining bytes from high to low
		for (let i = remainingBytes - 1; i >= 0; i--) {
			const shiftAmount = i * 8;
			const byte = Math.floor(value / Math.pow(2, shiftAmount)) & 0xff;
			writer.writeByte(byte);
		}
	}

	_decode(reader: Reader): number {
		const firstByte = reader.readByte();

		// Extract length from high 3 bits
		const lengthBits = firstByte & 0xe0;
		const remainingBytes = lengthBits / 32;

		if (remainingBytes === 0) {
			return firstByte;
		}

		// Extract value from low 5 bits
		let value = (firstByte & 0x1f) * Math.pow(2, remainingBytes * 8);

		// Read remaining bytes
		for (let i = remainingBytes - 1; i >= 0; i--) {
			const byte = reader.readByte();
			value += byte * Math.pow(2, i * 8);
		}

		return value;
	}
}

import { BufferfyRangeError } from "../../utilities/Error";
import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { VarIntCodecOptions } from ".";

const MAX_SAFE_VARINT60 = 281474976710656; // 2^48
const VARINT60_THRESHOLDS = [32, 8192, 2097152, 536870912, 137438953472, 35184372088832];

export class VarInt60Codec extends AbstractCodec<number> {
	constructor(protected readonly options?: VarIntCodecOptions) {
		super();
	}

	isValid(value: unknown): value is number {
		if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value >= MAX_SAFE_VARINT60 || value > Number.MAX_SAFE_INTEGER) return false;

		if (this.options?.minimum !== undefined && value < this.options.minimum) return false;
		if (this.options?.maximum !== undefined && value > this.options.maximum) return false;

		return true;
	}

	byteLength(value: number): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
		for (let i = 0; i < VARINT60_THRESHOLDS.length; i++) {
			if (value < VARINT60_THRESHOLDS[i]) return (i + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
		}
		return 7;
	}

	_encode(value: number, writer: Writer): void {
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "encode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} is less than minimum ${this.options.minimum}`,
				"VarInt60Codec",
				value,
				this.options.minimum
			);
		}

		if ((validationMode === "both" || validationMode === "encode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} exceeds maximum ${this.options.maximum}`,
				"VarInt60Codec",
				value,
				this.options.maximum
			);
		}

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
		const validationMode = this.options?.validationMode ?? "both";

		// Extract length from high 3 bits
		const lengthBits = firstByte & 0xe0;
		const remainingBytes = lengthBits / 32;

		if (remainingBytes === 0) {
			const value = firstByte;

			if ((validationMode === "both" || validationMode === "decode") && this.options?.minimum !== undefined && value < this.options.minimum) {
				throw new BufferfyRangeError(
					`Decoded value ${value} is less than minimum ${this.options.minimum}`,
					"VarInt60Codec",
					value,
					this.options.minimum,
					reader.position
				);
			}

			if ((validationMode === "both" || validationMode === "decode") && this.options?.maximum !== undefined && value > this.options.maximum) {
				throw new BufferfyRangeError(
					`Decoded value ${value} exceeds maximum ${this.options.maximum}`,
					"VarInt60Codec",
					value,
					this.options.maximum,
					reader.position
				);
			}

			return value;
		}

		// Extract value from low 5 bits
		let value = (firstByte & 0x1f) * Math.pow(2, remainingBytes * 8);

		// Read remaining bytes
		for (let i = remainingBytes - 1; i >= 0; i--) {
			const byte = reader.readByte();
			value += byte * Math.pow(2, i * 8);
		}

		if ((validationMode === "both" || validationMode === "decode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} is less than minimum ${this.options.minimum}`,
				"VarInt60Codec",
				value,
				this.options.minimum,
				reader.position
			);
		}

		if ((validationMode === "both" || validationMode === "decode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} exceeds maximum ${this.options.maximum}`,
				"VarInt60Codec",
				value,
				this.options.maximum,
				reader.position
			);
		}

		return value;
	}
}

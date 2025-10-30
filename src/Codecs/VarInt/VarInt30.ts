import { BufferfyRangeError } from "../../utilities/Error";
import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { VarIntCodecOptions } from ".";

const MAX_VARINT30 = 1073741824; // 2^30
const VARINT30_THRESHOLDS = [64, 16384, 4194304];

export class VarInt30Codec extends AbstractCodec<number> {
	constructor(protected readonly options?: VarIntCodecOptions) {
		super();
	}

	isValid(value: unknown): value is number {
		if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value >= MAX_VARINT30) return false;

		if (this.options?.minimum !== undefined && value < this.options.minimum) return false;
		if (this.options?.maximum !== undefined && value > this.options.maximum) return false;

		return true;
	}

	byteLength(value: number): 1 | 2 | 3 | 4 {
		for (let i = 0; i < VARINT30_THRESHOLDS.length; i++) {
			if (value < VARINT30_THRESHOLDS[i]) return (i + 1) as 1 | 2 | 3 | 4;
		}
		return 4;
	}

	_encode(value: number, writer: Writer): void {
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "encode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} is less than minimum ${this.options.minimum}`,
				"VarInt30Codec",
				value,
				this.options.minimum
			);
		}

		if ((validationMode === "both" || validationMode === "encode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} exceeds maximum ${this.options.maximum}`,
				"VarInt30Codec",
				value,
				this.options.maximum
			);
		}

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
		const validationMode = this.options?.validationMode ?? "both";

		// Extract length from high 2 bits
		const lengthBits = firstByte & 0xc0;
		const remainingBytes = lengthBits / 64;

		if (remainingBytes === 0) {
			const value = firstByte;

			if ((validationMode === "both" || validationMode === "decode") && this.options?.minimum !== undefined && value < this.options.minimum) {
				throw new BufferfyRangeError(
					`Decoded value ${value} is less than minimum ${this.options.minimum}`,
					"VarInt30Codec",
					value,
					this.options.minimum,
					reader.position
				);
			}

			if ((validationMode === "both" || validationMode === "decode") && this.options?.maximum !== undefined && value > this.options.maximum) {
				throw new BufferfyRangeError(
					`Decoded value ${value} exceeds maximum ${this.options.maximum}`,
					"VarInt30Codec",
					value,
					this.options.maximum,
					reader.position
				);
			}

			return value;
		}

		// Extract value from low 6 bits
		let value = (firstByte & 0x3f) << (remainingBytes * 8);

		// Read remaining bytes
		for (let i = remainingBytes - 1; i >= 0; i--) {
			const byte = reader.readByte();
			value += byte << (i * 8);
		}

		if ((validationMode === "both" || validationMode === "decode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} is less than minimum ${this.options.minimum}`,
				"VarInt30Codec",
				value,
				this.options.minimum,
				reader.position
			);
		}

		if ((validationMode === "both" || validationMode === "decode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} exceeds maximum ${this.options.maximum}`,
				"VarInt30Codec",
				value,
				this.options.maximum,
				reader.position
			);
		}

		return value;
	}
}

import { BufferfyRangeError } from "../../utilities/Error";
import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { VarIntCodecOptions } from ".";

const MAX_VARINT15 = 32768; // 2^15

export class VarInt15Codec extends AbstractCodec<number> {
	constructor(protected readonly options?: VarIntCodecOptions) {
		super();
	}

	isValid(value: unknown): value is number {
		if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value >= MAX_VARINT15) return false;

		if (this.options?.minimum !== undefined && value < this.options.minimum) return false;
		if (this.options?.maximum !== undefined && value > this.options.maximum) return false;

		return true;
	}

	byteLength(value: number): 1 | 2 {
		return value < 128 ? 1 : 2;
	}

	_encode(value: number, writer: Writer): void {
		const validationMode = this.options?.validationMode ?? "both";

		if ((validationMode === "both" || validationMode === "encode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} is less than minimum ${this.options.minimum}`,
				"VarInt15Codec",
				value,
				this.options.minimum
			);
		}

		if ((validationMode === "both" || validationMode === "encode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Encoded value ${value} exceeds maximum ${this.options.maximum}`,
				"VarInt15Codec",
				value,
				this.options.maximum
			);
		}

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
		const validationMode = this.options?.validationMode ?? "both";

		// Check high bit
		if ((firstByte & 0x80) === 0) {
			const value = firstByte;

			if ((validationMode === "both" || validationMode === "decode") && this.options?.minimum !== undefined && value < this.options.minimum) {
				throw new BufferfyRangeError(
					`Decoded value ${value} is less than minimum ${this.options.minimum}`,
					"VarInt15Codec",
					value,
					this.options.minimum,
					reader.position
				);
			}

			if ((validationMode === "both" || validationMode === "decode") && this.options?.maximum !== undefined && value > this.options.maximum) {
				throw new BufferfyRangeError(
					`Decoded value ${value} exceeds maximum ${this.options.maximum}`,
					"VarInt15Codec",
					value,
					this.options.maximum,
					reader.position
				);
			}

			return value;
		}

		// Two-byte value: low 7 bits of first byte + second byte
		const highBits = (firstByte & 0x7f) << 8;
		const lowBits = reader.readByte();
		const value = highBits + lowBits;

		if ((validationMode === "both" || validationMode === "decode") && this.options?.minimum !== undefined && value < this.options.minimum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} is less than minimum ${this.options.minimum}`,
				"VarInt15Codec",
				value,
				this.options.minimum,
				reader.position
			);
		}

		if ((validationMode === "both" || validationMode === "decode") && this.options?.maximum !== undefined && value > this.options.maximum) {
			throw new BufferfyRangeError(
				`Decoded value ${value} exceeds maximum ${this.options.maximum}`,
				"VarInt15Codec",
				value,
				this.options.maximum,
				reader.position
			);
		}

		return value;
	}
}

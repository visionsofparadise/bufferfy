import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { buildNumberValidators } from "../UInt";
import { VarIntCodecOptions } from ".";

const MAX_VARINT15 = 32768; // 2^15

export class VarInt15Codec extends AbstractCodec<number> {
	private readonly _validateEncode: ((value: number) => void) | null;
	private readonly _validateDecode: ((value: number, position: number) => void) | null;

	constructor(protected readonly options?: VarIntCodecOptions) {
		super();

		const validators = buildNumberValidators("VarInt15Codec", options);
		this._validateEncode = validators.validateEncode;
		this._validateDecode = validators.validateDecode;
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
		if (this._validateEncode !== null) this._validateEncode(value);

		if (value < 128) {
			const offset = writer.reserve(1);
			writer.bytes[offset] = value;
			return;
		}

		const offset = writer.reserve(2);
		const bytes = writer.bytes;

		// High bit indicates 2-byte encoding, low 7 bits store high value bits
		bytes[offset] = (value >>> 8) | 0x80;
		bytes[offset + 1] = value & 0xff;
	}

	_decode(reader: Reader): number {
		const firstByte = reader.readByte();

		let value: number;

		if ((firstByte & 0x80) === 0) {
			value = firstByte;
		} else {
			// Two-byte value: low 7 bits of first byte + second byte
			value = ((firstByte & 0x7f) << 8) + reader.readByte();
		}

		if (this._validateDecode !== null) this._validateDecode(value, reader.position);

		return value;
	}
}

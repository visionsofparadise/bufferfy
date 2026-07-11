import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { buildNumberValidators } from "../UInt";
import { VarIntCodecOptions } from ".";

const MAX_VARINT30 = 1073741824; // 2^30
const VARINT30_THRESHOLDS = [64, 16384, 4194304];

export class VarInt30Codec extends AbstractCodec<number> {
	private readonly _validateEncode: ((value: number) => void) | null;
	private readonly _validateDecode: ((value: number, position: number) => void) | null;

	constructor(protected readonly options?: VarIntCodecOptions) {
		super();

		const validators = buildNumberValidators("VarInt30Codec", options);
		this._validateEncode = validators.validateEncode;
		this._validateDecode = validators.validateDecode;
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
		if (this._validateEncode !== null) this._validateEncode(value);

		let byteLength = 4;
		for (let i = 0; i < VARINT30_THRESHOLDS.length; i++) {
			if (value < VARINT30_THRESHOLDS[i]) {
				byteLength = i + 1;
				break;
			}
		}

		const offset = writer.reserve(byteLength);
		const bytes = writer.bytes;

		if (byteLength === 1) {
			bytes[offset] = value;
			return;
		}

		// First byte: high 2 bits encode remaining byte count, low 6 bits store high value bits
		const remainingBytes = byteLength - 1;
		bytes[offset] = (remainingBytes << 6) | ((value >>> (remainingBytes * 8)) & 0x3f);

		// Write remaining bytes from high to low
		let position = offset + 1;
		for (let i = remainingBytes - 1; i >= 0; i--) {
			bytes[position++] = (value >>> (i * 8)) & 0xff;
		}
	}

	_decode(reader: Reader): number {
		const firstByte = reader.readByte();

		// Extract length from high 2 bits
		const remainingBytes = (firstByte & 0xc0) / 64;

		let value: number;

		if (remainingBytes === 0) {
			value = firstByte;
		} else {
			// Extract value from low 6 bits, then read remaining bytes high to low
			value = (firstByte & 0x3f) << (remainingBytes * 8);

			for (let i = remainingBytes - 1; i >= 0; i--) {
				value += reader.readByte() << (i * 8);
			}
		}

		if (this._validateDecode !== null) this._validateDecode(value, reader.position);

		return value;
	}
}

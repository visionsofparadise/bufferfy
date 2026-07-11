import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { buildNumberValidators } from "../UInt";
import { VarIntCodecOptions } from ".";

const MAX_SAFE_VARINT60 = 281474976710656; // 2^48
const VARINT60_THRESHOLDS = [32, 8192, 2097152, 536870912, 137438953472, 35184372088832];
const POW256 = [1, 256, 65536, 16777216, 4294967296, 1099511627776, 281474976710656]; // 256^0 .. 256^6, covers the 7-byte max shift of 2^48

export class VarInt60Codec extends AbstractCodec<number> {
	private readonly _validateEncode: ((value: number) => void) | null;
	private readonly _validateDecode: ((value: number, position: number) => void) | null;

	constructor(protected readonly options?: VarIntCodecOptions) {
		super();

		const validators = buildNumberValidators("VarInt60Codec", options);
		this._validateEncode = validators.validateEncode;
		this._validateDecode = validators.validateDecode;
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
		if (this._validateEncode !== null) this._validateEncode(value);

		let byteLength = 7;
		for (let i = 0; i < VARINT60_THRESHOLDS.length; i++) {
			if (value < VARINT60_THRESHOLDS[i]) {
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

		// First byte: high 3 bits encode remaining byte count, low 5 bits store high value bits
		const remainingBytes = byteLength - 1;
		bytes[offset] = (remainingBytes << 5) | (Math.floor(value / POW256[remainingBytes]) & 0x1f);

		// Write remaining bytes from high to low
		let position = offset + 1;
		for (let i = remainingBytes - 1; i >= 0; i--) {
			bytes[position++] = Math.floor(value / POW256[i]) & 0xff;
		}
	}

	_decode(reader: Reader): number {
		const firstByte = reader.readByte();

		// Extract length from high 3 bits
		const remainingBytes = (firstByte & 0xe0) / 32;

		let value: number;

		if (remainingBytes === 0) {
			value = firstByte;
		} else {
			// Extract value from low 5 bits, then read remaining bytes high to low
			value = (firstByte & 0x1f) * POW256[remainingBytes];

			for (let i = remainingBytes - 1; i >= 0; i--) {
				value += reader.readByte() * POW256[i];
			}
		}

		if (this._validateDecode !== null) this._validateDecode(value, reader.position);

		return value;
	}
}

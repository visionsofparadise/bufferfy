import { NUMBER_MATCHER, type CodecMatcher } from "../../utilities/matcher";
import { AbstractCodec } from "../Abstract";
import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";

const POW256 = [1, 256, 65536, 16777216, 4294967296, 1099511627776, 281474976710656]; // 256^0 .. 256^6, covers the 7-byte max shift of 2^48

export class VarInt60Codec extends AbstractCodec<number> {
	static MAX_VALUE = 281474976710656;
	static THRESHOLDS = [32, 8192, 2097152, 536870912, 137438953472, 35184372088832];

	isValid(value: unknown): value is number {
		return (
			typeof value === "number" &&
			Number.isInteger(value) &&
			value >= 0 &&
			value < VarInt60Codec.MAX_VALUE &&
			value <= Number.MAX_SAFE_INTEGER
		);
	}

	override get matcher(): CodecMatcher {
		return NUMBER_MATCHER;
	}

	byteLength(value: number): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
		for (let thresholdIndex = 0; thresholdIndex < VarInt60Codec.THRESHOLDS.length; thresholdIndex++) {
			if (value < VarInt60Codec.THRESHOLDS[thresholdIndex]) return (thresholdIndex + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
		}

		return 7;
	}

	_encode(value: number, writer: Writer): void {
		let byteLength = 7;

		for (let thresholdIndex = 0; thresholdIndex < VarInt60Codec.THRESHOLDS.length; thresholdIndex++) {
			if (value < VarInt60Codec.THRESHOLDS[thresholdIndex]) {
				byteLength = thresholdIndex + 1;

				break;
			}
		}

		const offset = writer.reserve(byteLength);
		const bytes = writer.currentBytes;

		if (byteLength === 1) {
			bytes[offset] = value;

			return;
		}

		const remainingBytes = byteLength - 1;

		bytes[offset] = (remainingBytes << 5) | (Math.floor(value / POW256[remainingBytes]) & 0x1f);

		let position = offset + 1;

		for (let byteIndex = remainingBytes - 1; byteIndex >= 0; byteIndex--) {
			bytes[position++] = Math.floor(value / POW256[byteIndex]) & 0xff;
		}
	}

	_decode(reader: Reader): number {
		const firstByte = reader.readByte();

		const remainingBytes = (firstByte & 0xe0) / 32;

		let value: number;

		if (remainingBytes === 0) {
			value = firstByte;
		} else {
			value = (firstByte & 0x1f) * POW256[remainingBytes];

			for (let byteIndex = remainingBytes - 1; byteIndex >= 0; byteIndex--) {
				value += reader.readByte() * POW256[byteIndex];
			}
		}

		return value;
	}
}

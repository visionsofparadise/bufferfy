import { NUMBER_MATCHER, type CodecMatcher } from "../../utilities/matcher";
import { AbstractCodec } from "../Abstract";
import { varIntByteLengthOf } from "./varIntByteLengthOf";
import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";

export class VarInt30Codec extends AbstractCodec<number> {
	static MAX_VALUE = 1073741824;
	static THRESHOLDS = [64, 16384, 4194304];

	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < VarInt30Codec.MAX_VALUE;
	}

	override get matcher(): CodecMatcher {
		return NUMBER_MATCHER;
	}

	byteLength(value: number): 1 | 2 | 3 | 4 {
		return varIntByteLengthOf(value, VarInt30Codec.THRESHOLDS, 4) as 1 | 2 | 3 | 4;
	}

	_encode(value: number, writer: Writer): void {
		const byteLength = varIntByteLengthOf(value, VarInt30Codec.THRESHOLDS, 4);

		const offset = writer.reserve(byteLength);
		const bytes = writer.currentBytes;

		if (byteLength === 1) {
			bytes[offset] = value;

			return;
		}

		const remainingBytes = byteLength - 1;

		bytes[offset] = (remainingBytes << 6) | ((value >>> (remainingBytes * 8)) & 0x3f);

		let position = offset + 1;

		for (let byteIndex = remainingBytes - 1; byteIndex >= 0; byteIndex--) {
			bytes[position++] = (value >>> (byteIndex * 8)) & 0xff;
		}
	}

	_decode(reader: Reader): number {
		const firstByte = reader.readByte();

		const remainingBytes = (firstByte & 0xc0) / 64;

		let value: number;

		if (remainingBytes === 0) {
			value = firstByte;
		} else {
			value = (firstByte & 0x3f) << (remainingBytes * 8);

			for (let byteIndex = remainingBytes - 1; byteIndex >= 0; byteIndex--) {
				value += reader.readByte() << (byteIndex * 8);
			}
		}

		return value;
	}
}

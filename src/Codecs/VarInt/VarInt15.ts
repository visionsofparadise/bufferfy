import { NUMBER_MATCHER, type CodecMatcher } from "../../utilities/matcher";
import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";

export class VarInt15Codec extends AbstractCodec<number> {
	static MAX_VALUE = 32768;

	isValid(value: unknown): value is number {
		return typeof value === "number" && Number.isInteger(value) && value >= 0 && value < VarInt15Codec.MAX_VALUE;
	}

	override get matcher(): CodecMatcher {
		return NUMBER_MATCHER;
	}

	byteLength(value: number): 1 | 2 {
		return value < 128 ? 1 : 2;
	}

	_encode(value: number, writer: Writer): void {
		if (value < 128) {
			const offset = writer.reserve(1);

			writer.currentBytes[offset] = value;

			return;
		}

		const offset = writer.reserve(2);
		const bytes = writer.currentBytes;

		bytes[offset] = (value >>> 8) | 0x80;
		bytes[offset + 1] = value & 0xff;
	}

	_decode(reader: Reader): number {
		const firstByte = reader.readByte();

		let value: number;

		if ((firstByte & 0x80) === 0) {
			value = firstByte;
		} else {
			value = ((firstByte & 0x7f) << 8) + reader.readByte();
		}

		return value;
	}
}

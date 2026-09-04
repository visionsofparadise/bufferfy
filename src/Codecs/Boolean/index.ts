import { BOOLEAN_MATCHER, type CodecMatcher } from "../../utilities/matcher";
import { AbstractCodec } from "../Abstract";
import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";

/**
 * Creates a codec for a boolean byte
 *
 * Serializes to ```[0 or 1]```
 *
 * @return	{BooleanCodec} BooleanCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Boolean/index.ts|Source}
 */
export const createBooleanCodec = () => new BooleanCodec();

export class BooleanCodec extends AbstractCodec<boolean> {
	isValid(value: unknown): value is boolean {
		return typeof value === "boolean";
	}

	override get matcher(): CodecMatcher {
		return BOOLEAN_MATCHER;
	}

	byteLength(): 1 {
		return 1;
	}

	_encode(value: boolean, writer: Writer): void {
		writer.writeByte(value ? 1 : 0);
	}

	_decode(reader: Reader): boolean {
		return reader.readByte() === 1;
	}
}

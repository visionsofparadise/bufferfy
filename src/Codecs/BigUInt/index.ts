import { BIGINT_MATCHER, type CodecMatcher } from "../../utilities/matcher";
import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import type { Endianness } from "../UInt";

const MAX_BIGUINT64 = 2n ** 64n;

/**
 * Creates a codec for a bigint.
 *
 * Serializes to ```[UINT64]```
 *
 * @param	{'LE' | 'BE'} [endianness='BE'] - Endianness
 * @return	{BigUIntCodec} BigUIntCodec
 *
 * {@link https://github.com/visionsofparadise/dataViewfy/blob/main/src/Codecs/BigUInt/index.ts|Source}
 */
export const createBigUIntCodec = (endianness: Endianness = "BE") => {
	switch (endianness) {
		case "BE": {
			return new BigUIntBECodec();
		}

		case "LE": {
			return new BigUIntLECodec();
		}
	}
};

export class BigUIntBECodec extends AbstractCodec<bigint> {
	static readonly BYTE_LENGTH = 8;

	isValid(value: unknown): value is bigint {
		return typeof value === "bigint" && value >= 0n && value < MAX_BIGUINT64;
	}

	override get matcher(): CodecMatcher {
		return BIGINT_MATCHER;
	}

	byteLength(): 8 {
		return BigUIntBECodec.BYTE_LENGTH;
	}

	_encode(value: bigint, writer: Writer): void {
		const offset = writer.reserve(8);

		writer.currentView.setBigUint64(offset, value, false);
	}

	_decode(reader: Reader): bigint {
		const offset = reader.skipBytes(8);

		return reader.view.getBigUint64(offset, false);
	}
}

export class BigUIntLECodec extends BigUIntBECodec {
	override _encode(value: bigint, writer: Writer): void {
		const offset = writer.reserve(8);

		writer.currentView.setBigUint64(offset, value, true);
	}

	override _decode(reader: Reader): bigint {
		const offset = reader.skipBytes(8);

		return reader.view.getBigUint64(offset, true);
	}
}

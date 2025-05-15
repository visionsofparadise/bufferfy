import { endianness as osEndianness } from "os";
import { Context } from "../../utilities/Context";
import { BufferfyByteLengthError } from "../../utilities/Error";
import { AbstractCodec } from "../Abstract";
import { Endianness } from "../UInt";

/**
 * Creates a codec for a bigint.
 *
 * Serializes to ```[UINT64]```
 *
 * @param	{'LE' | 'BE'} [endianness=os.endianness()] - Endianness
 * @return	{BigUIntCodec} BigUIntCodec
 *
 * {@link https://github.com/visionsofparadise/dataViewfy/blob/main/src/Codecs/BigUInt/index.ts|Source}
 */
export const createBigUIntCodec = (endianness: Endianness = osEndianness()) => {
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
	isValid(value: unknown): value is bigint {
		return typeof value === "bigint";
	}

	byteLength(): 8 {
		return 8;
	}

	_encode(value: bigint, buffer: Uint8Array, c: Context): void {
		const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

		dataView.setBigUint64(c.offset, value, false);

		c.offset += 8;
	}

	_decode(buffer: Uint8Array, c: Context): bigint {
		if (buffer.byteLength < c.offset + 8) throw new BufferfyByteLengthError();

		const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

		const value = dataView.getBigUint64(c.offset, false);

		c.offset += 8;

		return value;
	}
}

export class BigUIntLECodec extends BigUIntBECodec {
	_encode(value: bigint, buffer: Uint8Array, c: Context): void {
		const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

		dataView.setBigUint64(c.offset, value, true);

		c.offset += 8;
	}

	_decode(buffer: Uint8Array, c: Context): bigint {
		if (buffer.byteLength < c.offset + 8) throw new BufferfyByteLengthError();

		const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

		const value = dataView.getBigUint64(c.offset, true);

		c.offset += 8;

		return value;
	}
}

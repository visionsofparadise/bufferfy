import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { Endianness } from "../UInt";

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
		return typeof value === "bigint";
	}

	byteLength(): 8 {
		return BigUIntBECodec.BYTE_LENGTH;
	}

	_encode(value: bigint, writer: Writer): void {
		writer.writeDataView(BigUIntBECodec.BYTE_LENGTH, (view, offset) => view.setBigUint64(offset, value, false));
	}

	_decode(reader: Reader): bigint {
		return reader.readDataView(BigUIntBECodec.BYTE_LENGTH, (view, offset) => view.getBigUint64(offset, false));
	}
}

export class BigUIntLECodec extends BigUIntBECodec {
	_encode(value: bigint, writer: Writer): void {
		writer.writeDataView(BigUIntBECodec.BYTE_LENGTH, (view, offset) => view.setBigUint64(offset, value, true));
	}

	_decode(reader: Reader): bigint {
		return reader.readDataView(BigUIntBECodec.BYTE_LENGTH, (view, offset) => view.getBigUint64(offset, true));
	}
}

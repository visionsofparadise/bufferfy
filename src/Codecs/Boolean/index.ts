import { Context } from "../../utilities/Context";
import { BufferfyByteLengthError } from "../../utilities/Error";
import { AbstractCodec } from "../Abstract";

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

	byteLength(): 1 {
		return 1;
	}

	_encode(value: boolean, buffer: Uint8Array, c: Context): void {
		buffer[c.offset++] = value ? 1 : 0;
	}

	_decode(buffer: Uint8Array, c: Context): boolean {
		if (buffer.byteLength < c.offset + 1) throw new BufferfyByteLengthError();

		return buffer[c.offset++] === 1;
	}
}

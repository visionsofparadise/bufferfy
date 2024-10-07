import { Context } from "../../utilities/Context";
import { AbstractCodec } from "../Abstract";
import { DecodeTransform } from "../Abstract/DecodeTransform";

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

	byteLength(_value: boolean): number {
		return 1;
	}

	_encode(value: boolean, buffer: Buffer, c: Context): void {
		buffer[c.offset++] = value ? 1 : 0;
	}

	_decode(buffer: Buffer, c: Context): boolean {
		return buffer[c.offset++] === 1;
	}

	async _decodeChunks(transform: DecodeTransform): Promise<boolean> {
		const buffer = await transform._consume(1);

		return this.decode(buffer);
	}
}

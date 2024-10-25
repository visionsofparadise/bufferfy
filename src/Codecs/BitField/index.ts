import { Context } from "../../utilities/Context";
import { BufferfyByteLengthError } from "../../utilities/Error";
import { AbstractCodec } from "../Abstract";

const BIT_MAP: Record<number, number> = {
	0: 0x80,
	1: 0x40,
	2: 0x20,
	3: 0x10,
	4: 0x08,
	5: 0x04,
	6: 0x02,
	7: 0x01,
};

/**
 * Creates a codec for boolean flags packed into bits of a byte.
 *
 * Serializes to ```[...FLAG_BYTES]```
 *
 * Packs up to 8 boolean values associated with the given keys, into each byte.
 *
 * @param	{Array<string>} keys - Keys for each boolean flag.
 * @return	{BitFieldCodec} BitFieldCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/BitField/index.ts|Source}
 */
export const createBitFieldCodec = <Key extends string>(keys: Array<Key>) => new BitFieldCodec(keys);

export class BitFieldCodec<Key extends string> extends AbstractCodec<Record<Key, boolean>> {
	constructor(public readonly keys: Array<Key>) {
		super();
	}

	isValid(value: unknown): value is Record<Key, boolean> {
		if (!value || typeof value !== "object") return false;

		for (const key of this.keys) if (typeof value[key as keyof typeof value] !== "boolean") return false;

		return true;
	}

	byteLength(_value: Record<Key, boolean>): number {
		return Math.ceil(this.keys.length / 8);
	}

	_encode(value: Record<Key, boolean>, buffer: Buffer, c: Context): void {
		for (let i = 0; i < this.keys.length; i++) {
			if (i % 8 === 0) buffer[c.offset] = 0;

			if (value[this.keys[i]] === true) buffer[c.offset] |= BIT_MAP[i % 8];

			if (i % 8 === 7) c.offset++;
		}

		if (this.keys.length % 8 !== 0) c.offset++;
	}

	_decode(buffer: Buffer, c: Context): Record<Key, boolean> {
		if (buffer.byteLength < c.offset + Math.ceil(this.keys.length / 8)) throw new BufferfyByteLengthError();

		const value: Partial<Record<Key, boolean>> = {};

		for (let i = 0; i < this.keys.length; i++) {
			value[this.keys[i]] = (buffer[c.offset] & BIT_MAP[i % 8]) > 0;

			if (i % 8 === 7) c.offset++;
		}

		if (this.keys.length % 8 !== 0) c.offset++;

		return value as Record<Key, boolean>;
	}
}

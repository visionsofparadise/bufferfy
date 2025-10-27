import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
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
 * @param	{number} [byteLength] - Sets a fixed length.
 * @return	{BitFieldCodec} BitFieldCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/BitField/index.ts|Source}
 */
export const createBitFieldCodec = <Key extends string>(keys: Array<Key>, byteLength?: number) => new BitFieldCodec(keys, byteLength);

export class BitFieldCodec<Key extends string> extends AbstractCodec<Record<Key, boolean>> {
	constructor(public readonly keys: Array<Key>, private readonly _byteLength: number = Math.ceil(keys.length / 8)) {
		super();
	}

	isValid(value: unknown): value is Record<Key, boolean> {
		if (!value || typeof value !== "object") return false;

		for (const key of this.keys) if (typeof value[key as keyof typeof value] !== "boolean") return false;

		return true;
	}

	byteLength(): number {
		return this._byteLength;
	}

	_encode(value: Record<Key, boolean>, writer: Writer): void {
		for (let i = 0; i < this._byteLength; i++) {
			let byte = 0;

			for (let j = 0; j < Math.min(this.keys.length - i * 8, 8); j++) {
				if (value[this.keys[i * 8 + j]] === true) byte |= BIT_MAP[j % 8];
			}

			writer.writeByte(byte);
		}
	}

	_decode(reader: Reader): Record<Key, boolean> {
		const value: Partial<Record<Key, boolean>> = {};

		for (let i = 0; i < this._byteLength; i++) {
			const byte = reader.readByte();

			for (let j = 0; j < Math.min(this.keys.length - i * 8, 8); j++) {
				value[this.keys[i * 8 + j]] = (byte & BIT_MAP[j % 8]) > 0;
			}
		}

		return value as Record<Key, boolean>;
	}
}

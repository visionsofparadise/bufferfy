import { OBJECT_MATCHER, type CodecMatcher } from "../../utilities/matcher";
import { AbstractCodec } from "../Abstract";
import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";

const BIT_MAP = [0x80, 0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01];

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
export const createBitFieldCodec = <Key extends string>(keys: Array<Key>, byteLength?: number) =>
	new BitFieldCodec(keys, byteLength);

export class BitFieldCodec<Key extends string> extends AbstractCodec<Record<Key, boolean>> {
	constructor(
		public readonly keys: Array<Key>,
		private readonly _byteLength: number = Math.ceil(keys.length / 8),
	) {
		super();
	}

	isValid(value: unknown): value is Record<Key, boolean> {
		if (!value || typeof value !== "object") return false;

		for (const key of this.keys) if (typeof value[key as keyof typeof value] !== "boolean") return false;

		return true;
	}

	override get matcher(): CodecMatcher {
		return OBJECT_MATCHER;
	}

	byteLength(): number {
		return this._byteLength;
	}

	_encode(value: Record<Key, boolean>, writer: Writer): void {
		for (let byteIndex = 0; byteIndex < this._byteLength; byteIndex++) {
			let byte = 0;

			const offset = byteIndex * 8;
			const bits = Math.min(this.keys.length - offset, 8);

			for (let bitIndex = 0; bitIndex < bits; bitIndex++) {
				if (value[this.keys[offset + bitIndex]] === true) byte |= BIT_MAP[bitIndex];
			}

			writer.writeByte(byte);
		}
	}

	_decode(reader: Reader): Record<Key, boolean> {
		const value: Partial<Record<Key, boolean>> = {};

		for (let byteIndex = 0; byteIndex < this._byteLength; byteIndex++) {
			const byte = reader.readByte();

			const offset = byteIndex * 8;
			const bits = Math.min(this.keys.length - offset, 8);

			for (let bitIndex = 0; bitIndex < bits; bitIndex++) {
				value[this.keys[offset + bitIndex]] = (byte & BIT_MAP[bitIndex]) > 0;
			}
		}

		return value as Record<Key, boolean>;
	}
}

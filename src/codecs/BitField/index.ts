import { Context } from "../../utilities/Context";
import { PointableOptions } from "../../utilities/Pointable";
import { Stream } from "../../utilities/Stream";
import { AbstractCodec } from "../Abstract";

const BYTE_MAP: Record<number, number> = {
	0: 0x80,
	1: 0x40,
	2: 0x20,
	3: 0x10,
	4: 0x08,
	5: 0x04,
	6: 0x02,
	7: 0x01,
};

export interface BitFieldCodecOptions extends PointableOptions {}

export class BitFieldCodec<Key extends PropertyKey> extends AbstractCodec<Record<Key, boolean>> {
	private readonly _byteLength: number;
	private readonly _keys: Array<Key>;
	private readonly _reverseByteKeys: Array<Array<Key>> = [];

	constructor(keys: Array<Key>, options?: BitFieldCodecOptions) {
		super();

		this._id = options?.id;
		this._keys = keys;
		this._byteLength = Math.ceil(keys.length / 8);

		let byteKeys: Array<Key> = [];

		for (const key of keys) {
			byteKeys.push(key);

			if (byteKeys.length === 8) {
				byteKeys.reverse();

				this._reverseByteKeys.push(byteKeys);

				byteKeys = [];
			}
		}

		if (byteKeys.length) {
			byteKeys.reverse();

			this._reverseByteKeys.push(byteKeys);
		}

		this._reverseByteKeys.reverse();
	}

	match(value: any, context: Context): value is Record<Key, boolean> {
		if (!value || typeof value !== "object") return false;

		let index = this._keys.length;

		while (index--) {
			const key = this._keys[index];

			if (typeof value[key] !== "boolean") return false;
		}

		this.setContext(value, context);

		return true;
	}

	encodingLength(value: Record<Key, boolean>, context: Context): number {
		this.setContext(value, context);

		return this._byteLength;
	}

	write(value: Record<Key, boolean>, stream: Stream, context: Context): void {
		this.setContext(value, context);

		let byteKeysIndex = this._reverseByteKeys.length;

		while (byteKeysIndex--) {
			stream.buffer[stream.position] = 0;

			const byteKeys = this._reverseByteKeys[byteKeysIndex];

			let index = byteKeys.length;

			while (index--) {
				if (value[byteKeys[index]]) {
					stream.buffer[stream.position] |= BYTE_MAP[(byteKeys.length - (index + 1)) % 8];
				}
			}

			stream.position++;
		}
	}

	read(stream: Stream, context: Context): Record<Key, boolean> {
		const value: Partial<Record<Key, boolean>> = {};

		let byteKeysIndex = this._reverseByteKeys.length;

		while (byteKeysIndex--) {
			const byteKeys = this._reverseByteKeys[byteKeysIndex];

			let index = byteKeys.length;

			while (index--) {
				value[byteKeys[index]] = (stream.buffer[stream.position] & BYTE_MAP[(byteKeys.length - (index + 1)) % 8]) > 0;
			}

			stream.position++;
		}

		this.setContext(value as Record<Key, boolean>, context);

		return value as Record<Key, boolean>;
	}
}

export const createBitFieldCodec = <Key extends PropertyKey>(...parameters: ConstructorParameters<typeof BitFieldCodec<Key>>) => {
	return new BitFieldCodec<Key>(...parameters);
};

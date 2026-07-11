import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { VarInt60Codec } from "../VarInt/VarInt60";

export class RecordVariableCodec<Key extends string, Value extends any> extends AbstractCodec<Record<Key, Value>> {
	constructor(
		public readonly keyCodec: AbstractCodec<Key>,
		public readonly valueCodec: AbstractCodec<Value>,
		public readonly lengthCodec: AbstractCodec<number> = new VarInt60Codec()
	) {
		super();
	}

	isValid(value: unknown): value is Record<Key, Value> {
		if (value === null || typeof value !== "object") return false;

		for (const key in value) {
			const property = (value as Record<string, unknown>)[key];
			if (!this.keyCodec.isValid(key) || !this.valueCodec.isValid(property)) return false;
		}

		return true;
	}

	byteLength(value: Record<Key, Value>): number {
		let count = 0;
		let byteLength = 0;

		for (const key in value) {
			count++;
			const property = value[key];
			byteLength += this.keyCodec.byteLength(key as Key) + this.valueCodec.byteLength(property);
		}

		byteLength += this.lengthCodec.byteLength(count);

		return byteLength;
	}

	_encode(value: Record<Key, Value>, writer: Writer): void {
		// for...in (not Object.keys) so inherited enumerable keys stay part of the encoded output
		const keys: Array<Key> = [];

		for (const key in value) keys.push(key as Key);

		this.lengthCodec._encode(keys.length, writer);

		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			const property = value[key];
			this.keyCodec._encode(key, writer);
			this.valueCodec._encode(property, writer);
		}
	}

	_decode(reader: Reader): Record<Key, Value> {
		const value: Partial<Record<Key, Value>> = {};

		let index = this.lengthCodec._decode(reader);

		while (index--) {
			const key = this.keyCodec._decode(reader);

			value[key] = this.valueCodec._decode(reader);
		}

		return value as Record<Key, Value>;
	}
}

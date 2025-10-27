import { BufferfyRangeError } from "../../utilities/Error";
import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { VarInt60Codec } from "../VarInt/VarInt60";

const DEFAULT_MAX_ENTRIES = 1000000; // 1M entries

export class RecordVariableCodec<Key extends string, Value extends any> extends AbstractCodec<Record<Key, Value>> {
	constructor(
		public readonly keyCodec: AbstractCodec<Key>,
		public readonly valueCodec: AbstractCodec<Value>,
		public readonly lengthCodec: AbstractCodec<number> = new VarInt60Codec(),
		public readonly maxEntries: number = DEFAULT_MAX_ENTRIES
	) {
		super();
	}

	isValid(value: unknown): value is Record<Key, Value> {
		if (value === null || typeof value !== "object") return false;

		let count = 0;
		for (const key in value) {
			count++;
			const property = (value as Record<string, unknown>)[key];
			if (!this.keyCodec.isValid(key) || !this.valueCodec.isValid(property)) return false;
		}

		if (count > this.maxEntries) return false;

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
		let count = 0;

		// Count properties
		for (const _ in value) count++;

		if (count > this.maxEntries) {
			throw new BufferfyRangeError(
				`Record size ${count} exceeds maximum allowed entries ${this.maxEntries}`,
				"RecordVariableCodec",
				count,
				this.maxEntries,
			);
		}

		this.lengthCodec._encode(count, writer);

		for (const key in value) {
			const property = value[key];
			this.keyCodec._encode(key as Key, writer);
			this.valueCodec._encode(property, writer);
		}
	}

	_decode(reader: Reader): Record<Key, Value> {
		const value: Partial<Record<Key, Value>> = {};

		let index = this.lengthCodec._decode(reader);

		if (index > this.maxEntries) {
			throw new BufferfyRangeError(
				`Decoded record size ${index} exceeds maximum allowed entries ${this.maxEntries}`,
				"RecordVariableCodec",
				index,
				this.maxEntries,
				reader.position,
			);
		}

		while (index--) {
			const key = this.keyCodec._decode(reader);

			value[key] = this.valueCodec._decode(reader);
		}

		return value as Record<Key, Value>;
	}
}

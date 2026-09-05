import { OBJECT_MATCHER, type CodecMatcher } from "../../utilities/matcher";
import { AbstractCodec } from "../Abstract";
import { decodeEntries } from "./entries";
import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";

export class RecordFixedCodec<Key extends string, Value> extends AbstractCodec<Record<Key, Value>> {
	constructor(
		public readonly length: number,
		public readonly keyCodec: AbstractCodec<Key>,
		public readonly valueCodec: AbstractCodec<Value>,
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

		if (count !== this.length) return false;

		return true;
	}

	override get matcher(): CodecMatcher {
		return OBJECT_MATCHER;
	}

	byteLength(value: Record<Key, Value>): number {
		let byteLength = 0;

		for (const key in value) {
			const property = value[key];

			byteLength += this.keyCodec.byteLength(key) + this.valueCodec.byteLength(property);
		}

		return byteLength;
	}

	_encode(value: Record<Key, Value>, writer: Writer): void {
		for (const key in value) {
			this.keyCodec._encode(key, writer);
			this.valueCodec._encode(value[key], writer);
		}
	}

	_decode(reader: Reader): Record<Key, Value> {
		return decodeEntries(this.length, this.keyCodec, this.valueCodec, reader);
	}
}

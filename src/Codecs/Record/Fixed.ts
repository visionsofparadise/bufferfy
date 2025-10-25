import { Context } from "../../utilities/Context";
import { AbstractCodec } from "../Abstract";

export class RecordFixedCodec<Key extends string, Value extends any> extends AbstractCodec<Record<Key, Value>> {
	constructor(public readonly length: number, public readonly keyCodec: AbstractCodec<Key>, public readonly valueCodec: AbstractCodec<Value>) {
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

	byteLength(value: Record<Key, Value>): number {
		let byteLength = 0;

		for (const key in value) {
			const property = value[key];
			byteLength += this.keyCodec.byteLength(key as Key) + this.valueCodec.byteLength(property);
		}

		return byteLength;
	}

	_encode(value: Record<Key, Value>, buffer: Uint8Array, c: Context): void {
		for (const key in value) {
			const property = value[key];
			this.keyCodec._encode(key as Key, buffer, c);
			this.valueCodec._encode(property, buffer, c);
		}
	}

	_decode(buffer: Uint8Array, c: Context): Record<Key, Value> {
		const value: Partial<Record<Key, Value>> = {};

		let index = this.length;

		while (index--) value[this.keyCodec._decode(buffer, c)] = this.valueCodec._decode(buffer, c);

		return value as Record<Key, Value>;
	}
}

import { Context } from "../../utilities/Context";
import { AbstractCodec } from "../Abstract";
import { DecodeTransform } from "../Abstract/DecodeTransform";
import { EncodeTransform } from "../Abstract/EncodeTransform";

export class RecordFixedCodec<Key extends string, Value extends any> extends AbstractCodec<Record<Key, Value>> {
	constructor(public readonly length: number, public readonly keyCodec: AbstractCodec<Key>, public readonly valueCodec: AbstractCodec<Value>) {
		super();
	}

	isValid(value: unknown): value is Record<Key, Value> {
		if (value === null || typeof value !== "object") return false;

		const entries = Object.entries(value);

		if (entries.length !== this.length) return false;

		for (const [key, property] of entries) if (!this.keyCodec.isValid(key) || !this.valueCodec.isValid(property)) return false;

		return true;
	}

	byteLength(value: Record<Key, Value>): number {
		let byteLength = 0;

		for (const [key, property] of Object.entries(value) as Array<[Key, Value]>) byteLength += this.keyCodec.byteLength(key) + this.valueCodec.byteLength(property);

		return byteLength;
	}

	_encode(value: Record<Key, Value>, buffer: Buffer, c: Context): void {
		for (const [key, property] of Object.entries(value) as Array<[Key, Value]>) {
			this.keyCodec._encode(key, buffer, c);
			this.valueCodec._encode(property, buffer, c);
		}
	}

	async _encodeChunks(value: Record<Key, Value>, transform: EncodeTransform): Promise<void> {
		for (const [key, property] of Object.entries(value) as Array<[Key, Value]>) {
			const byteLength = this.keyCodec.byteLength(key) + this.valueCodec.byteLength(property);

			const buffer = Buffer.allocUnsafe(byteLength);
			const c = new Context();

			this.keyCodec._encode(key, buffer, c);
			this.valueCodec._encode(property, buffer, c);

			await transform.pushAsync(buffer);
		}
	}

	_decode(buffer: Buffer, c: Context): Record<Key, Value> {
		const value: Partial<Record<Key, Value>> = {};

		let index = this.length;

		while (index--) value[this.keyCodec._decode(buffer, c)] = this.valueCodec._decode(buffer, c);

		return value as Record<Key, Value>;
	}

	async _decodeChunks(transform: DecodeTransform): Promise<Record<Key, Value>> {
		const value: Partial<Record<Key, Value>> = {};

		let index = this.length;

		while (index--) value[await this.keyCodec._decodeChunks(transform)] = await this.valueCodec._decodeChunks(transform);

		return value as Record<Key, Value>;
	}
}
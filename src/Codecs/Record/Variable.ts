import { Context } from "../../utilities/Context";
import { AbstractCodec } from "../Abstract";
import { DecodeTransform } from "../Abstract/DecodeTransform";
import { EncodeTransform } from "../Abstract/EncodeTransform";
import { VarInt60Codec } from "../VarInt/VarInt60";

export class RecordVariableCodec<Key extends string, Value extends any> extends AbstractCodec<Record<Key, Value>> {
	constructor(public readonly keyCodec: AbstractCodec<Key>, public readonly valueCodec: AbstractCodec<Value>, public readonly lengthCodec: AbstractCodec<number> = new VarInt60Codec()) {
		super();
	}

	isValid(value: unknown): value is Record<Key, Value> {
		if (value === null || typeof value !== "object") return false;

		for (const [key, property] of Object.entries(value)) if (!this.keyCodec.isValid(key) || !this.valueCodec.isValid(property)) return false;

		return true;
	}

	byteLength(value: Record<Key, Value>): number {
		const entries = Object.entries(value) as Array<[Key, Value]>;

		let byteLength = this.lengthCodec.byteLength(entries.length);

		for (const [key, property] of entries) byteLength += this.keyCodec.byteLength(key) + this.valueCodec.byteLength(property);

		return byteLength;
	}

	_encode(value: Record<Key, Value>, buffer: Buffer, c: Context): void {
		const entries = Object.entries(value) as Array<[Key, Value]>;

		this.lengthCodec._encode(entries.length, buffer, c);

		for (const [key, property] of entries) {
			this.keyCodec._encode(key, buffer, c);
			this.valueCodec._encode(property, buffer, c);
		}
	}

	async _encodeChunks(value: Record<Key, Value>, transform: EncodeTransform): Promise<void> {
		const entries = Object.entries(value) as Array<[Key, Value]>;

		await this.lengthCodec._encodeChunks(entries.length, transform);

		for (const [key, property] of entries) {
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

		let index = this.lengthCodec._decode(buffer, c);

		while (index--) {
			const key = this.keyCodec._decode(buffer, c);

			value[key] = this.valueCodec._decode(buffer, c);
		}

		return value as Record<Key, Value>;
	}

	async _decodeChunks(transform: DecodeTransform): Promise<Record<Key, Value>> {
		const value: Partial<Record<Key, Value>> = {};

		let index = await this.lengthCodec._decodeChunks(transform);

		while (index--) {
			const key = await this.keyCodec._decodeChunks(transform);

			value[key] = await this.valueCodec._decodeChunks(transform);
		}

		return value as Record<Key, Value>;
	}
}

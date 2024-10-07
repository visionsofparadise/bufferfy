import { Context } from "../../utilities/Context";
import { AbstractCodec } from "../Abstract";
import { DecodeTransform } from "../Abstract/DecodeTransform";
import { EncodeTransform } from "../Abstract/EncodeTransform";

export class ArrayFixedCodec<Item> extends AbstractCodec<Array<Item>> {
	constructor(public readonly length: number, public readonly itemCodec: AbstractCodec<Item>) {
		super();
	}

	isValid(value: unknown): value is Array<Item> {
		if (!Array.isArray(value) || value.length !== this.length) return false;

		for (const item of value) if (!this.itemCodec.isValid(item)) return false;

		return true;
	}

	byteLength(value: Array<Item>): number {
		let byteLength = 0;

		for (const item of value) byteLength += this.itemCodec.byteLength(item);

		return byteLength;
	}

	_encode(value: Array<Item>, buffer: Buffer, c: Context): void {
		for (const item of value) this.itemCodec._encode(item, buffer, c);
	}

	async _encodeChunks(value: Array<Item>, transform: EncodeTransform): Promise<void> {
		for (const item of value) await this.itemCodec._encodeChunks(item, transform);
	}

	_decode(buffer: Buffer, c: Context): Array<Item> {
		const value: Array<Item> = Array(this.length);

		for (let i = 0; i < this.length; i++) value[i] = this.itemCodec._decode(buffer, c);

		return value;
	}

	async _decodeChunks(transform: DecodeTransform): Promise<Array<Item>> {
		const value: Array<Item> = Array(this.length);

		for (let i = 0; i < this.length; i++) value[i] = await this.itemCodec._decodeChunks(transform);

		return value;
	}
}

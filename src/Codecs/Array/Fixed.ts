import { Context } from "../../utilities/Context";
import { AbstractCodec } from "../Abstract";

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

	_encode(value: Array<Item>, buffer: Uint8Array, c: Context): void {
		for (const item of value) this.itemCodec._encode(item, buffer, c);
	}

	_decode(buffer: Uint8Array, c: Context): Array<Item> {
		const value: Array<Item> = Array(this.length);

		for (let i = 0; i < this.length; i++) value[i] = this.itemCodec._decode(buffer, c);

		return value;
	}
}

import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";

export class ArrayFixedCodec<Item> extends AbstractCodec<Array<Item>> {
	constructor(public readonly length: number, public readonly itemCodec: AbstractCodec<Item>) {
		super();
	}

	isValid(value: unknown): value is Array<Item> {
		if (!Array.isArray(value) || value.length !== this.length) return false;

		for (let i = 0; i < value.length; i++) if (!this.itemCodec.isValid(value[i])) return false;

		return true;
	}

	byteLength(value: Array<Item>): number {
		let byteLength = 0;

		for (let i = 0; i < value.length; i++) byteLength += this.itemCodec.byteLength(value[i]);

		return byteLength;
	}

	_encode(value: Array<Item>, writer: Writer): void {
		for (let i = 0; i < value.length; i++) this.itemCodec._encode(value[i], writer);
	}

	_decode(reader: Reader): Array<Item> {
		const value: Array<Item> = Array(this.length);

		for (let i = 0; i < this.length; i++) value[i] = this.itemCodec._decode(reader);

		return value;
	}
}

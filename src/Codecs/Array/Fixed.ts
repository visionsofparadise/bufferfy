import { ARRAY_MATCHER, type CodecMatcher } from "../../utilities/matcher";
import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";

export class ArrayFixedCodec<Item> extends AbstractCodec<Array<Item>> {
	constructor(
		public readonly length: number,
		public readonly itemCodec: AbstractCodec<Item>,
	) {
		super();
	}

	isValid(value: unknown): value is Array<Item> {
		if (!Array.isArray(value) || value.length !== this.length) return false;

		for (let index = 0; index < value.length; index++) if (!this.itemCodec.isValid(value[index])) return false;

		return true;
	}

	override get matcher(): CodecMatcher {
		return ARRAY_MATCHER;
	}

	byteLength(value: Array<Item>): number {
		let byteLength = 0;

		for (let index = 0; index < value.length; index++) byteLength += this.itemCodec.byteLength(value[index]);

		return byteLength;
	}

	_encode(value: Array<Item>, writer: Writer): void {
		for (let index = 0; index < value.length; index++) this.itemCodec._encode(value[index], writer);
	}

	_decode(reader: Reader): Array<Item> {
		const value: Array<Item> = Array(this.length);

		for (let index = 0; index < this.length; index++) value[index] = this.itemCodec._decode(reader);

		return value;
	}
}

import { ARRAY_MATCHER, type CodecMatcher } from "../../utilities/matcher";
import { AbstractCodec } from "../Abstract";
import { areItemsValid, decodeItems, encodeItems, itemsByteLength } from "./items";
import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";

export class ArrayFixedCodec<Item> extends AbstractCodec<Array<Item>> {
	constructor(
		public readonly length: number,
		public readonly itemCodec: AbstractCodec<Item>,
	) {
		super();
	}

	isValid(value: unknown): value is Array<Item> {
		if (!Array.isArray(value) || value.length !== this.length) return false;

		return areItemsValid(value as Array<unknown>, this.itemCodec);
	}

	override get matcher(): CodecMatcher {
		return ARRAY_MATCHER;
	}

	byteLength(value: Array<Item>): number {
		return itemsByteLength(value, this.itemCodec);
	}

	_encode(value: Array<Item>, writer: Writer): void {
		encodeItems(value, this.itemCodec, writer);
	}

	_decode(reader: Reader): Array<Item> {
		return decodeItems(this.length, this.itemCodec, reader);
	}
}

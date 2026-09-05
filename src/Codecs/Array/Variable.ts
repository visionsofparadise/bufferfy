import { ARRAY_MATCHER, type CodecMatcher } from "../../utilities/matcher";
import { AbstractCodec } from "../Abstract";
import { VarInt60Codec } from "../VarInt/VarInt60";
import { areItemsValid, decodeItems, encodeItems, itemsByteLength } from "./items";
import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";

export class ArrayVariableCodec<Item> extends AbstractCodec<Array<Item>> {
	constructor(
		public readonly itemCodec: AbstractCodec<Item>,
		public readonly lengthCodec: AbstractCodec<number> = new VarInt60Codec(),
	) {
		super();
	}

	isValid(value: unknown): value is Array<Item> {
		if (!Array.isArray(value)) return false;

		return areItemsValid(value as Array<unknown>, this.itemCodec);
	}

	override get matcher(): CodecMatcher {
		return ARRAY_MATCHER;
	}

	byteLength(value: Array<Item>): number {
		return this.lengthCodec.byteLength(value.length) + itemsByteLength(value, this.itemCodec);
	}

	_encode(value: Array<Item>, writer: Writer): void {
		this.lengthCodec._encode(value.length, writer);

		encodeItems(value, this.itemCodec, writer);
	}

	_decode(reader: Reader): Array<Item> {
		return decodeItems(this.lengthCodec._decode(reader), this.itemCodec, reader);
	}
}

import { ARRAY_MATCHER, type CodecMatcher } from "../../utilities/matcher";
import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { VarInt60Codec } from "../VarInt/VarInt60";

export class ArrayVariableCodec<Item> extends AbstractCodec<Array<Item>> {
	constructor(public readonly itemCodec: AbstractCodec<Item>, public readonly lengthCodec: AbstractCodec<number> = new VarInt60Codec()) {
		super();
	}

	isValid(value: unknown): value is Array<Item> {
		if (!Array.isArray(value)) return false;

		for (let index = 0; index < value.length; index++) if (!this.itemCodec.isValid(value[index])) return false;

		return true;
	}

	override get matcher(): CodecMatcher {
		return ARRAY_MATCHER;
	}

	byteLength(value: Array<Item>): number {
		let byteLength = this.lengthCodec.byteLength(value.length);

		for (let index = 0; index < value.length; index++) byteLength += this.itemCodec.byteLength(value[index]);

		return byteLength;
	}

	_encode(value: Array<Item>, writer: Writer): void {
		this.lengthCodec._encode(value.length, writer);

		for (let index = 0; index < value.length; index++) this.itemCodec._encode(value[index], writer);
	}

	_decode(reader: Reader): Array<Item> {
		const length = this.lengthCodec._decode(reader);

		const value: Array<Item> = Array(length);

		for (let index = 0; index < length; index++) value[index] = this.itemCodec._decode(reader);

		return value;
	}
}

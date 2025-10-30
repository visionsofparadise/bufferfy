import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { VarInt60Codec } from "../VarInt/VarInt60";

export class ArrayVariableCodec<Item> extends AbstractCodec<Array<Item>> {
	constructor(public readonly itemCodec: AbstractCodec<Item>, public readonly lengthCodec: AbstractCodec<number> = new VarInt60Codec()) {
		super();
	}

	isValid(value: unknown): value is Array<Item> {
		if (!Array.isArray(value)) return false;

		for (const item of value) if (!this.itemCodec.isValid(item)) return false;

		return true;
	}

	byteLength(value: Array<Item>): number {
		let byteLength = this.lengthCodec.byteLength(value.length);

		for (const item of value) byteLength += this.itemCodec.byteLength(item);

		return byteLength;
	}

	_encode(value: Array<Item>, writer: Writer): void {
		this.lengthCodec._encode(value.length, writer);

		for (const item of value) this.itemCodec._encode(item, writer);
	}

	_decode(reader: Reader): Array<Item> {
		const length = this.lengthCodec._decode(reader);

		const value: Array<Item> = Array(length);

		for (let i = 0; i < length; i++) value[i] = this.itemCodec._decode(reader);

		return value;
	}
}

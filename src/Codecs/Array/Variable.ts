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

		for (let i = 0; i < value.length; i++) if (!this.itemCodec.isValid(value[i])) return false;

		return true;
	}

	byteLength(value: Array<Item>): number {
		let byteLength = this.lengthCodec.byteLength(value.length);

		for (let i = 0; i < value.length; i++) byteLength += this.itemCodec.byteLength(value[i]);

		return byteLength;
	}

	_encode(value: Array<Item>, writer: Writer): void {
		this.lengthCodec._encode(value.length, writer);

		for (let i = 0; i < value.length; i++) this.itemCodec._encode(value[i], writer);
	}

	_decode(reader: Reader): Array<Item> {
		const length = this.lengthCodec._decode(reader);

		const value: Array<Item> = Array(length);

		for (let i = 0; i < length; i++) value[i] = this.itemCodec._decode(reader);

		return value;
	}
}

import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { StringVariableCodec } from "../String/Variable";
import { VarInt60Codec } from "../VarInt/VarInt60";

export class NumberVariableCodec extends AbstractCodec<bigint> {
	private _hexCodec: StringVariableCodec;

	constructor(public readonly lengthCodec: AbstractCodec<number> = new VarInt60Codec()) {
		super();

		this._hexCodec = new StringVariableCodec("hex", lengthCodec);
	}

	isValid(value: unknown): value is bigint {
		return typeof value === "bigint";
	}

	byteLength(value: bigint): number {
		return this._hexCodec.byteLength(value.toString(16));
	}

	_encode(value: bigint, writer: Writer): void {
		this._hexCodec._encode(value.toString(16), writer);
	}

	_decode(reader: Reader): bigint {
		const hex = this._hexCodec._decode(reader);

		return BigInt("0x" + hex);
	}
}

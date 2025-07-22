import { Context } from "../../utilities/Context";
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

	_encode(value: bigint, buffer: Uint8Array, c: Context): void {
		this._hexCodec._encode(value.toString(16), buffer, c);
	}

	_decode(buffer: Uint8Array, c: Context): bigint {
		const hex = this._hexCodec._decode(buffer, c);

		return BigInt("0x" + hex);
	}
}

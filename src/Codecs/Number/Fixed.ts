import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { StringFixedCodec } from "../String/Fixed";

export class NumberFixedCodec extends AbstractCodec<bigint> {
	protected _byteLength: number;
	private _hexCodec: StringFixedCodec;

	constructor(byteLength: number) {
		super();

		this._byteLength = byteLength;
		this._hexCodec = new StringFixedCodec(byteLength, "hex");
	}

	isValid(value: unknown): value is bigint {
		return typeof value === "bigint";
	}

	byteLength(): number {
		return this._byteLength;
	}

	_encode(value: bigint, writer: Writer): void {
		this._hexCodec._encode(value.toString(16).padStart(this._byteLength * 2, "0"), writer);
	}

	_decode(reader: Reader): bigint {
		const hex = this._hexCodec._decode(reader);

		return BigInt("0x" + hex);
	}
}

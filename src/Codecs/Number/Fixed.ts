import { Context } from "../../utilities/Context";
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

	_encode(value: bigint, buffer: Uint8Array, c: Context): void {
		this._hexCodec._encode(value.toString(16).padStart(this._byteLength * 2, "0"), buffer, c);
	}

	_decode(buffer: Uint8Array, c: Context): bigint {
		const hex = this._hexCodec._decode(buffer, c);

		return BigInt("0x" + hex);
	}
}

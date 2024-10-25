import { Context } from "../../utilities/Context";
import { BufferfyByteLengthError } from "../../utilities/Error";
import { AbstractCodec } from "../Abstract";

export class StringFixedCodec extends AbstractCodec<string> {
	private _byteLength: number;

	constructor(byteLength: number, public readonly encoding: BufferEncoding = "utf8") {
		super();

		this._byteLength = byteLength;
	}

	isValid(value: unknown): value is string {
		return typeof value === "string";
	}

	byteLength(_value: string): number {
		return this._byteLength;
	}

	_encode(value: string, buffer: Buffer, c: Context): void {
		c.offset += buffer.write(value, c.offset, this._byteLength, this.encoding);
	}

	_decode(buffer: Buffer, c: Context): string {
		if (buffer.byteLength < c.offset + this._byteLength) throw new BufferfyByteLengthError();

		return buffer.toString(this.encoding, c.offset, (c.offset += this._byteLength));
	}
}

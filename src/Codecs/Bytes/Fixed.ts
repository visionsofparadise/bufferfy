import { Context } from "../../utilities/Context";
import { BufferfyByteLengthError } from "../../utilities/Error";
import { AbstractCodec } from "../Abstract";

export class BytesFixedCodec extends AbstractCodec<Uint8Array> {
	protected _byteLength: number;

	constructor(byteLength: number) {
		super();

		this._byteLength = byteLength;
	}

	isValid(value: unknown): value is Uint8Array {
		return value instanceof Uint8Array;
	}

	byteLength(): number {
		return this._byteLength;
	}

	_encode(value: Uint8Array, buffer: Uint8Array, c: Context): void {
		for (const byte of value) buffer[c.offset++] = byte;
	}

	_decode(buffer: Uint8Array, c: Context): Uint8Array {
		if (buffer.byteLength < c.offset + this._byteLength) throw new BufferfyByteLengthError();

		const value = new Uint8Array(buffer.buffer, buffer.byteOffset + c.offset, this._byteLength);

		c.offset += this._byteLength;

		return value;
	}
}

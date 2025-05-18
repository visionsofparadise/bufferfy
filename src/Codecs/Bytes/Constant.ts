import { compare } from "uint8array-tools";
import { Context } from "../../utilities/Context";
import { BytesFixedCodec } from "./Fixed";

export class BytesConstantCodec extends BytesFixedCodec {
	constructor(public readonly bytes: Uint8Array) {
		super(bytes.byteLength);
	}

	isValid(value: unknown): value is Uint8Array {
		return value instanceof Uint8Array && compare(value, this.bytes) === 0;
	}

	_encode(_: any, buffer: Uint8Array, c: Context): void {
		for (const byte of this.bytes) buffer[c.offset++] = byte;
	}

	_decode(_: Uint8Array, c: Context): Uint8Array {
		c.offset += this._byteLength;

		return this.bytes;
	}
}

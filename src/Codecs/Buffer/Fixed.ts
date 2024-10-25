import { Context } from "../../utilities/Context";
import { BufferfyByteLengthError } from "../../utilities/Error";
import { AbstractCodec } from "../Abstract";

export class BufferFixedCodec extends AbstractCodec<Buffer> {
	private _byteLength: number;

	constructor(byteLength: number) {
		super();

		this._byteLength = byteLength;
	}

	isValid(value: unknown): value is Buffer {
		return value instanceof Buffer;
	}

	byteLength(_: Buffer): number {
		return this._byteLength;
	}

	_encode(value: Buffer, buffer: Buffer, c: Context): void {
		c.offset += value.copy(buffer, c.offset);
	}

	_decode(buffer: Buffer, c: Context): Buffer {
		if (buffer.byteLength < c.offset + this._byteLength) throw new BufferfyByteLengthError();

		return buffer.subarray(c.offset, (c.offset += this._byteLength));
	}
}

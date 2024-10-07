import { Context } from "../../utilities/Context";
import { AbstractCodec } from "../Abstract";
import { DecodeTransform } from "../Abstract/DecodeTransform";
import { EncodeTransform } from "../Abstract/EncodeTransform";

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

	async _encodeChunks(value: Buffer, transform: EncodeTransform): Promise<void> {
		let offset = 0;

		while (offset < this._byteLength) {
			const chunk = value.subarray(offset, (offset += Math.min(this._byteLength - offset, transform.readableHighWaterMark - transform.readableLength)));

			await transform.pushAsync(chunk);
		}
	}

	_decode(buffer: Buffer, c: Context): Buffer {
		return buffer.subarray(c.offset, (c.offset += this._byteLength));
	}

	async _decodeChunks(transform: DecodeTransform): Promise<Buffer> {
		return transform._consume(this._byteLength);
	}
}

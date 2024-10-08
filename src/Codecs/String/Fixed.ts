import { Context } from "../../utilities/Context";
import { AbstractCodec } from "../Abstract";
import { DecodeTransform } from "../Abstract/DecodeTransform";
import { EncodeTransform } from "../Abstract/EncodeTransform";

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

	async _encodeChunks(value: string, transform: EncodeTransform): Promise<void> {
		const buffer = Buffer.from(value, this.encoding);
		let offset = 0;

		while (offset < this._byteLength) {
			const chunk = buffer.subarray(offset, (offset += Math.min(this._byteLength - offset, transform.readableHighWaterMark - transform.readableLength)));

			await transform.pushAsync(chunk);
		}
	}

	_decode(buffer: Buffer, c: Context): string {
		return buffer.toString(this.encoding, c.offset, (c.offset += this._byteLength));
	}

	async _decodeChunks(transform: DecodeTransform): Promise<string> {
		let value = "";

		let byteLength = this._byteLength;

		while (byteLength) {
			const buffer = await transform.consume(byteLength, 16);

			value += buffer.toString(this.encoding);
			byteLength -= buffer.byteLength;
		}

		return value;
	}
}

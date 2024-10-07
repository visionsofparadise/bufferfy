import { Context } from "../../utilities/Context";
import { AbstractCodec } from "../Abstract";
import { DecodeTransform } from "../Abstract/DecodeTransform";
import { EncodeTransform } from "../Abstract/EncodeTransform";
import { VarInt60Codec } from "../VarInt/VarInt60";

export class StringVariableCodec extends AbstractCodec<string> {
	constructor(public readonly encoding: BufferEncoding = "utf8", public readonly lengthCodec: AbstractCodec<number> = new VarInt60Codec()) {
		super();
	}

	isValid(value: unknown): value is string {
		return typeof value === "string";
	}

	byteLength(value: string): number {
		const byteLength = Buffer.byteLength(value, this.encoding);

		return this.lengthCodec.byteLength(byteLength) + byteLength;
	}

	_encode(value: string, buffer: Buffer, c: Context): void {
		const byteLength = Buffer.byteLength(value, this.encoding);

		this.lengthCodec._encode(byteLength, buffer, c);

		c.offset += buffer.write(value, c.offset, c.offset + byteLength, this.encoding);
	}

	async _encodeChunks(value: string, transform: EncodeTransform): Promise<void> {
		const buffer = Buffer.from(value, this.encoding);

		await this.lengthCodec._encodeChunks(buffer.byteLength, transform);

		let offset = 0;

		while (offset < buffer.byteLength) {
			const chunk = buffer.subarray(offset, (offset += Math.min(buffer.byteLength - offset, transform.readableHighWaterMark - transform.readableLength)));

			await transform.pushAsync(chunk);
		}
	}

	_decode(buffer: Buffer, c: Context): string {
		const byteLength = this.lengthCodec._decode(buffer, c);

		return buffer.toString(this.encoding, c.offset, (c.offset += byteLength));
	}

	async _decodeChunks(transform: DecodeTransform): Promise<string> {
		let value = "";

		let byteLength = await this.lengthCodec._decodeChunks(transform);

		while (byteLength) {
			const buffer = await transform._consume(byteLength, 16);

			value += buffer.toString(this.encoding);
			byteLength -= buffer.byteLength;
		}

		return value;
	}
}

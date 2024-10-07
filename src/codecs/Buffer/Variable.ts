import { Context } from "../../utilities/Context";
import { AbstractCodec } from "../Abstract";
import { DecodeTransform } from "../Abstract/DecodeTransform";
import { EncodeTransform } from "../Abstract/EncodeTransform";
import { VarInt60Codec } from "../VarInt/VarInt60";

export class BufferVariableCodec extends AbstractCodec<Buffer> {
	constructor(public readonly lengthCodec: AbstractCodec<number> = new VarInt60Codec()) {
		super();
	}

	isValid(value: unknown): value is Buffer {
		return value instanceof Buffer;
	}

	byteLength(value: Buffer): number {
		return this.lengthCodec.byteLength(value.byteLength) + value.byteLength;
	}

	_encode(value: Buffer, buffer: Buffer, c: Context): void {
		this.lengthCodec._encode(value.byteLength, buffer, c);

		c.offset += value.copy(buffer, c.offset);
	}

	async _encodeChunks(value: Buffer, transform: EncodeTransform): Promise<void> {
		await this.lengthCodec._encodeChunks(value.byteLength, transform);

		let offset = 0;

		while (offset < value.byteLength) {
			const chunk = value.subarray(offset, (offset += Math.min(value.byteLength - offset, transform.readableHighWaterMark - transform.readableLength)));

			await transform.pushAsync(chunk);
		}
	}

	_decode(buffer: Buffer, c: Context): Buffer {
		const byteLength = this.lengthCodec._decode(buffer, c);

		return buffer.subarray(c.offset, (c.offset += byteLength));
	}

	async _decodeChunks(transform: DecodeTransform): Promise<Buffer> {
		const byteLength = await this.lengthCodec._decodeChunks(transform);

		return transform._consume(byteLength);
	}
}

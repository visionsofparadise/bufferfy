import { Context } from "../../utilities/Context";
import { BufferfyByteLengthError } from "../../utilities/Error";
import { AbstractCodec } from "../Abstract";
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

	_decode(buffer: Buffer, c: Context): Buffer {
		const byteLength = this.lengthCodec._decode(buffer, c);

		if (buffer.byteLength < c.offset + byteLength) throw new BufferfyByteLengthError();

		return buffer.subarray(c.offset, (c.offset += byteLength));
	}
}

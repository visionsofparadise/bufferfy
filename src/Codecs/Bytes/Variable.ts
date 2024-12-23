import { Context } from "../../utilities/Context";
import { BufferfyByteLengthError } from "../../utilities/Error";
import { AbstractCodec } from "../Abstract";
import { VarInt60Codec } from "../VarInt/VarInt60";

export class BytesVariableCodec extends AbstractCodec<Uint8Array> {
	constructor(public readonly lengthCodec: AbstractCodec<number> = new VarInt60Codec()) {
		super();
	}

	isValid(value: unknown): value is Uint8Array {
		return value instanceof Uint8Array;
	}

	byteLength(value: Uint8Array): number {
		return this.lengthCodec.byteLength(value.byteLength) + value.byteLength;
	}

	_encode(value: Uint8Array, buffer: Uint8Array, c: Context): void {
		this.lengthCodec._encode(value.byteLength, buffer, c);

		for (const byte of value) buffer[c.offset++] = byte;
	}

	_decode(buffer: Uint8Array, c: Context): Uint8Array {
		const byteLength = this.lengthCodec._decode(buffer, c);

		if (buffer.byteLength < c.offset + byteLength) throw new BufferfyByteLengthError();

		const value = new Uint8Array(buffer.buffer, buffer.byteOffset + c.offset, byteLength);

		c.offset += byteLength;

		return value;
	}
}

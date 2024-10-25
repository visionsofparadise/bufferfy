import { Context } from "../../utilities/Context";
import { BufferfyByteLengthError } from "../../utilities/Error";
import { AbstractCodec } from "../Abstract";
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

	_decode(buffer: Buffer, c: Context): string {
		const byteLength = this.lengthCodec._decode(buffer, c);

		if (buffer.byteLength < c.offset + byteLength) throw new BufferfyByteLengthError();

		return buffer.toString(this.encoding, c.offset, (c.offset += byteLength));
	}
}

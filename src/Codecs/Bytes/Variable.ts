import { BufferfyRangeError } from "../../utilities/Error";
import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { VarInt60Codec } from "../VarInt/VarInt60";

const DEFAULT_MAX_LENGTH = 10 * 1024 * 1024; // 10MB

export class BytesVariableCodec extends AbstractCodec<Uint8Array> {
	constructor(public readonly lengthCodec: AbstractCodec<number> = new VarInt60Codec(), public readonly maxLength: number = DEFAULT_MAX_LENGTH) {
		super();
	}

	isValid(value: unknown): value is Uint8Array {
		return value instanceof Uint8Array && value.byteLength <= this.maxLength;
	}

	byteLength(value: Uint8Array): number {
		return this.lengthCodec.byteLength(value.byteLength) + value.byteLength;
	}

	_encode(value: Uint8Array, writer: Writer): void {
		if (value.byteLength > this.maxLength) {
			throw new BufferfyRangeError(
				`Bytes length ${value.byteLength} exceeds maximum allowed length ${this.maxLength}`,
				"BytesVariableCodec",
				value.byteLength,
				this.maxLength,
			);
		}

		this.lengthCodec._encode(value.byteLength, writer);
		writer.writeBytes(value);
	}

	_decode(reader: Reader): Uint8Array {
		const byteLength = this.lengthCodec._decode(reader);

		if (byteLength > this.maxLength) {
			throw new BufferfyRangeError(
				`Decoded bytes length ${byteLength} exceeds maximum allowed length ${this.maxLength}`,
				"BytesVariableCodec",
				byteLength,
				this.maxLength,
				reader.position,
			);
		}

		return reader.readBytes(byteLength);
	}
}

import { BYTES_MATCHER, type CodecMatcher } from "../../utilities/matcher";
import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { VarInt60Codec } from "../VarInt/VarInt60";

export class BytesVariableCodec extends AbstractCodec<Uint8Array> {
	constructor(public readonly lengthCodec: AbstractCodec<number> = new VarInt60Codec()) {
		super();
	}

	isValid(value: unknown): value is Uint8Array {
		return value instanceof Uint8Array;
	}

	override get matcher(): CodecMatcher {
		return BYTES_MATCHER;
	}

	byteLength(value: Uint8Array): number {
		return this.lengthCodec.byteLength(value.byteLength) + value.byteLength;
	}

	_encode(value: Uint8Array, writer: Writer): void {
		this.lengthCodec._encode(value.byteLength, writer);
		writer.writeBytes(value);
	}

	_decode(reader: Reader): Uint8Array {
		const byteLength = this.lengthCodec._decode(reader);

		return reader.readBytes(byteLength);
	}
}

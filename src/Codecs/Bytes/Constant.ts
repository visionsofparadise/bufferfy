import { compare } from "uint8array-tools";
import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";
import { BytesFixedCodec } from "./Fixed";

export class BytesConstantCodec extends BytesFixedCodec {
	constructor(public readonly bytes: Uint8Array) {
		super(bytes.byteLength);
	}

	override isValid(value: unknown): value is Uint8Array {
		if (!(value instanceof Uint8Array)) return false;

		return compare(value, this.bytes) === 0;
	}

	override _encode(_: Uint8Array, writer: Writer): void {
		writer.writeBytes(this.bytes);
	}

	override _decode(reader: Reader): Uint8Array {
		reader.readBytes(this._byteLength);

		return this.bytes;
	}
}

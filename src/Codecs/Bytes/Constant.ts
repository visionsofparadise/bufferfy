import { compare } from "uint8array-tools";
import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { BytesFixedCodec } from "./Fixed";

const constantTimeCompare = (a: Uint8Array, b: Uint8Array): boolean => {
	if (a.byteLength !== b.byteLength) return false;

	let result = 0;
	for (let i = 0; i < a.byteLength; i++) {
		result |= a[i] ^ b[i];
	}

	return result === 0;
};

export class BytesConstantCodec extends BytesFixedCodec {
	constructor(public readonly bytes: Uint8Array, public readonly constantTime: boolean = false) {
		super(bytes.byteLength);
	}

	isValid(value: unknown): value is Uint8Array {
		if (!(value instanceof Uint8Array)) return false;

		if (this.constantTime) {
			return constantTimeCompare(value, this.bytes);
		}

		return compare(value, this.bytes) === 0;
	}

	_encode(_: Uint8Array, writer: Writer): void {
		writer.writeBytes(this.bytes);
	}

	_decode(reader: Reader): Uint8Array {
		// Skip the bytes but don't validate (constant value already known)
		reader.readBytes(this._byteLength);

		return this.bytes;
	}
}

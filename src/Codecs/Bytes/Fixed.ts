import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";

export class BytesFixedCodec extends AbstractCodec<Uint8Array> {
	protected _byteLength: number;

	constructor(byteLength: number) {
		super();

		this._byteLength = byteLength;
	}

	isValid(value: unknown): value is Uint8Array {
		return value instanceof Uint8Array && value.byteLength === this._byteLength;
	}

	byteLength(): number {
		return this._byteLength;
	}

	_encode(value: Uint8Array, writer: Writer): void {
		writer.writeBytes(value);
	}

	_decode(reader: Reader): Uint8Array {
		return reader.readBytes(this._byteLength);
	}
}

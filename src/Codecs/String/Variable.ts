import { base32, base58, base64, base64url, hex } from "@scure/base";
import { StringEncoding } from ".";
import { Context } from "../../utilities/Context";
import { BufferfyError } from "../../utilities/Error";
import { AbstractCodec } from "../Abstract";
import { BytesVariableCodec } from "../Bytes/Variable";
import { VarInt60Codec } from "../VarInt/VarInt60";

export class StringVariableCodec extends AbstractCodec<string> {
	private _bufferCodec: BytesVariableCodec;

	constructor(public readonly encoding: StringEncoding = "utf8", public readonly lengthCodec: AbstractCodec<number> = new VarInt60Codec()) {
		super();

		this._bufferCodec = new BytesVariableCodec(this.lengthCodec);
	}

	isValid(value: unknown): value is string {
		return typeof value === "string";
	}

	byteLength(value: string): number {
		let valueBuffer: Uint8Array | undefined;

		switch (this.encoding) {
			case "hex": {
				const byteLength = value.length / 2;

				return this.lengthCodec.byteLength(byteLength) + byteLength;
			}
			case "base32": {
				valueBuffer = base32.decode(value);

				break;
			}
			case "base58": {
				valueBuffer = base58.decode(value);

				break;
			}
			case "base64": {
				valueBuffer = base64.decode(value);

				break;
			}
			case "base64url": {
				valueBuffer = base64url.decode(value);

				break;
			}
			case "utf8": {
				valueBuffer = new TextEncoder().encode(value);

				break;
			}
		}

		if (!valueBuffer) throw new BufferfyError("Invalid encoding");

		return this._bufferCodec.byteLength(valueBuffer);
	}

	_encode(value: string, buffer: Uint8Array, c: Context): void {
		let valueBuffer: Uint8Array | undefined;

		switch (this.encoding) {
			case "hex": {
				valueBuffer = hex.decode(value);

				break;
			}
			case "base32": {
				valueBuffer = base32.decode(value);

				break;
			}
			case "base58": {
				valueBuffer = base58.decode(value);

				break;
			}
			case "base64": {
				valueBuffer = base64.decode(value);

				break;
			}
			case "base64url": {
				valueBuffer = base64url.decode(value);

				break;
			}
			case "utf8": {
				valueBuffer = new TextEncoder().encode(value);

				break;
			}
		}

		if (!valueBuffer) throw new BufferfyError("Invalid encoding");

		this._bufferCodec._encode(valueBuffer, buffer, c);
	}

	_decode(buffer: Uint8Array, c: Context): string {
		const valueBuffer = this._bufferCodec._decode(buffer, c);

		let value: string | undefined;

		switch (this.encoding) {
			case "hex": {
				value = hex.encode(valueBuffer);

				break;
			}
			case "base32": {
				value = base32.encode(valueBuffer);

				break;
			}
			case "base58": {
				value = base58.encode(valueBuffer);

				break;
			}
			case "base64": {
				value = base64.encode(valueBuffer);

				break;
			}
			case "base64url": {
				value = base64url.encode(valueBuffer);

				break;
			}
			case "utf8": {
				value = new TextDecoder().decode(valueBuffer);

				break;
			}
		}

		return value;
	}
}

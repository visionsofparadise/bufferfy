import { base32, base58, base64, base64url, hex } from "@scure/base";
import { StringEncoding } from ".";
import { Context } from "../../utilities/Context";
import { BufferfyError } from "../../utilities/Error";
import { AbstractCodec } from "../Abstract";
import { BytesFixedCodec } from "../Bytes/Fixed";

export class StringFixedCodec extends AbstractCodec<string> {
	private _byteLength: number;
	private _bufferCodec: BytesFixedCodec;

	constructor(byteLength: number, public readonly encoding: StringEncoding = "utf8") {
		super();

		this._byteLength = byteLength;
		this._bufferCodec = new BytesFixedCodec(byteLength);
	}

	isValid(value: unknown): value is string {
		return typeof value === "string";
	}

	byteLength(_value: string): number {
		return this._byteLength;
	}

	_encode(value: string, buffer: Uint8Array, c: Context): void {
		if (this.encoding === "utf8") {
			const result = new TextEncoder().encodeInto(value, new Uint8Array(buffer.buffer, buffer.byteOffset + c.offset, this._byteLength));

			c.offset += result.written;

			return;
		}

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

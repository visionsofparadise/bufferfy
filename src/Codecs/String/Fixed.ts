import { base32, base58, base64, base64url, hex } from "@scure/base";
import { StringEncoding } from ".";
import { Context } from "../../utilities/Context";
import { AbstractCodec } from "../Abstract";
import { BytesFixedCodec } from "../Bytes/Fixed";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export class StringFixedCodec extends AbstractCodec<string> {
	private _byteLength: number;
	private _bufferCodec: BytesFixedCodec;
	private _encoder: (value: string, buffer: Uint8Array, c: Context) => void;
	private _decoder: (buffer: Uint8Array) => string;

	constructor(byteLength: number, public readonly encoding: StringEncoding = "utf8") {
		super();

		this._byteLength = byteLength;
		this._bufferCodec = new BytesFixedCodec(byteLength);

		if (encoding === "utf8") {
			this._encoder = (value, buffer, c) => {
				const result = textEncoder.encodeInto(value, new Uint8Array(buffer.buffer, buffer.byteOffset + c.offset, this._byteLength));
				c.offset += result.written;
			};
			this._decoder = (buffer) => textDecoder.decode(buffer);

			return;
		}

		let encoder: (str: string) => Uint8Array;
		let decoder: (data: Uint8Array) => string;

		switch (encoding) {
			case "hex": {
				encoder = hex.decode;
				decoder = hex.encode;

				break;
			}
			case "base32": {
				encoder = base32.decode;
				decoder = base32.encode;

				break;
			}
			case "base58": {
				encoder = base58.decode;
				decoder = base58.encode;

				break;
			}
			case "base64": {
				encoder = base64.decode;
				decoder = base64.encode;

				break;
			}
			case "base64url": {
				encoder = base64url.decode;
				decoder = base64url.encode;

				break;
			}
		}

		this._encoder = (value, buffer, c) => {
			const valueBuffer = encoder(value);
			this._bufferCodec._encode(valueBuffer, buffer, c);
		};
		this._decoder = (buffer) => decoder(buffer);
	}

	isValid(value: unknown): value is string {
		return typeof value === "string";
	}

	byteLength(): number {
		return this._byteLength;
	}

	_encode(value: string, buffer: Uint8Array, c: Context): void {
		this._encoder(value, buffer, c);
	}

	_decode(buffer: Uint8Array, c: Context): string {
		const valueBuffer = this._bufferCodec._decode(buffer, c);

		return this._decoder(valueBuffer);
	}
}

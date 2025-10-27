import { base32, base58, base64, base64url, hex } from "@scure/base";
import { StringEncoding } from ".";
import { Reader } from "../../utilities/Reader";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { BytesVariableCodec } from "../Bytes/Variable";
import { VarInt60Codec } from "../VarInt/VarInt60";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const DEFAULT_MAX_STRING_BYTES = 10 * 1024 * 1024; // 10MB

export class StringVariableCodec extends AbstractCodec<string> {
	private _bufferCodec: BytesVariableCodec;
	private _encoder: (value: string) => Uint8Array;
	private _decoder: (buffer: Uint8Array) => string;
	private _getByteLength: (value: string) => number;

	constructor(
		public readonly encoding: StringEncoding = "utf8",
		public readonly lengthCodec: AbstractCodec<number> = new VarInt60Codec(),
		public readonly maxLength: number = DEFAULT_MAX_STRING_BYTES
	) {
		super();

		this._bufferCodec = new BytesVariableCodec(this.lengthCodec, maxLength);

		switch (encoding) {
			case "hex":
				this._encoder = (value) => hex.decode(value);
				this._decoder = (buffer) => hex.encode(buffer);
				this._getByteLength = (value) => {
					const byteLength = value.length / 2;
					return this.lengthCodec.byteLength(byteLength) + byteLength;
				};

				break;
			case "base32":
				this._encoder = (value) => base32.decode(value);
				this._decoder = (buffer) => base32.encode(buffer);
				this._getByteLength = (value) => this._bufferCodec.byteLength(base32.decode(value));

				break;
			case "base58":
				this._encoder = (value) => base58.decode(value);
				this._decoder = (buffer) => base58.encode(buffer);
				this._getByteLength = (value) => this._bufferCodec.byteLength(base58.decode(value));

				break;
			case "base64":
				this._encoder = (value) => base64.decode(value);
				this._decoder = (buffer) => base64.encode(buffer);
				this._getByteLength = (value) => this._bufferCodec.byteLength(base64.decode(value));

				break;
			case "base64url":
				this._encoder = (value) => base64url.decode(value);
				this._decoder = (buffer) => base64url.encode(buffer);
				this._getByteLength = (value) => this._bufferCodec.byteLength(base64url.decode(value));

				break;
			case "utf8":
				this._encoder = (value) => textEncoder.encode(value);
				this._decoder = (buffer) => textDecoder.decode(buffer);
				this._getByteLength = (value) => this._bufferCodec.byteLength(textEncoder.encode(value));

				break;
		}
	}

	isValid(value: unknown): value is string {
		return typeof value === "string";
	}

	byteLength(value: string): number {
		return this._getByteLength(value);
	}

	_encode(value: string, writer: Writer): void {
		const valueBuffer = this._encoder(value);

		this._bufferCodec._encode(valueBuffer, writer);
	}

	_decode(reader: Reader): string {
		const valueBuffer = this._bufferCodec._decode(reader);

		return this._decoder(valueBuffer);
	}
}

import { base32, base58, base64, base64url } from "@scure/base";
import { StringEncoding } from ".";
import { decodeHex, encodeHex, hexByteLength } from "../../utilities/hex";
import { Reader } from "../../utilities/Reader";
import { decodeUtf8, encodeUtf8Into, utf8ByteLength } from "../../utilities/utf8";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { BytesVariableCodec } from "../Bytes/Variable";
import { VarInt60Codec } from "../VarInt/VarInt60";

export class StringVariableCodec extends AbstractCodec<string> {
	private _bufferCodec: BytesVariableCodec;
	private _encoder: (value: string, writer: Writer) => void;
	private _decoder: (reader: Reader) => string;
	private _getByteLength: (value: string) => number;

	constructor(
		public readonly encoding: StringEncoding = "utf8",
		public readonly lengthCodec: AbstractCodec<number> = new VarInt60Codec()
	) {
		super();

		this._bufferCodec = new BytesVariableCodec(this.lengthCodec);

		if (encoding === "utf8") {
			this._encoder = (value, writer) => {
				const byteLength = utf8ByteLength(value);

				this.lengthCodec._encode(byteLength, writer);

				const offset = writer.reserve(byteLength);

				encodeUtf8Into(value, writer.bytes, offset);
			};
			this._decoder = (reader) => {
				const byteLength = this.lengthCodec._decode(reader);
				const start = reader.skipBytes(byteLength);

				return decodeUtf8(reader.bytes, start, start + byteLength);
			};
			this._getByteLength = (value) => {
				const byteLength = utf8ByteLength(value);

				return this.lengthCodec.byteLength(byteLength) + byteLength;
			};

			return;
		}

		let encoder: (value: string) => Uint8Array;
		let decoder: (buffer: Uint8Array) => string;

		switch (encoding) {
			case "hex":
				encoder = decodeHex;
				decoder = encodeHex;
				this._getByteLength = (value) => {
					const byteLength = hexByteLength(value);
					return this.lengthCodec.byteLength(byteLength) + byteLength;
				};

				break;
			case "base32":
				encoder = base32.decode;
				decoder = base32.encode;
				this._getByteLength = (value) => this._bufferCodec.byteLength(base32.decode(value));

				break;
			case "base58":
				encoder = base58.decode;
				decoder = base58.encode;
				this._getByteLength = (value) => this._bufferCodec.byteLength(base58.decode(value));

				break;
			case "base64":
				encoder = base64.decode;
				decoder = base64.encode;
				this._getByteLength = (value) => this._bufferCodec.byteLength(base64.decode(value));

				break;
			case "base64url":
				encoder = base64url.decode;
				decoder = base64url.encode;
				this._getByteLength = (value) => this._bufferCodec.byteLength(base64url.decode(value));

				break;
		}

		this._encoder = (value, writer) => this._bufferCodec._encode(encoder(value), writer);
		this._decoder = (reader) => decoder(this._bufferCodec._decode(reader));
	}

	isValid(value: unknown): value is string {
		return typeof value === "string";
	}

	byteLength(value: string): number {
		return this._getByteLength(value);
	}

	_encode(value: string, writer: Writer): void {
		this._encoder(value, writer);
	}

	_decode(reader: Reader): string {
		return this._decoder(reader);
	}
}

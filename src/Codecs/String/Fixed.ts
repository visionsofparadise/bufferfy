import { base32, base58, base64, base64url } from "@scure/base";
import { decodeHex, encodeHex } from "../../utilities/hex";
import { decodeUtf8, encodeUtf8Into, SHORT_STRING_THRESHOLD, utf8ByteLength } from "../../utilities/utf8";
import { BytesFixedCodec } from "../Bytes/Fixed";
import { AbstractStringCodec } from "./Abstract";
import type { StringEncoding } from ".";
import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";

const textEncoder = new TextEncoder();

export class StringFixedCodec extends AbstractStringCodec {
	private _byteLength: number;
	private _bufferCodec: BytesFixedCodec;
	private _encoder: (value: string, writer: Writer) => void;
	private _decoder: (reader: Reader) => string;

	constructor(
		byteLength: number,
		public readonly encoding: StringEncoding = "utf8",
	) {
		super();

		this._byteLength = byteLength;
		this._bufferCodec = new BytesFixedCodec(byteLength);

		if (encoding === "utf8") {
			this._encoder = (value, writer) => {
				const offset = writer.reserve(this._byteLength);
				const target = writer.currentBytes;

				if (value.length <= SHORT_STRING_THRESHOLD) {
					const byteLength = utf8ByteLength(value);

					if (byteLength <= this._byteLength) {
						encodeUtf8Into(value, target, offset);
						target.fill(0, offset + byteLength, offset + this._byteLength);

						return;
					}
				}

				const encoded = textEncoder.encode(value);
				const copyLength = Math.min(encoded.byteLength, this._byteLength);

				target.set(encoded.subarray(0, copyLength), offset);
				target.fill(0, offset + copyLength, offset + this._byteLength);
			};

			this._decoder = (reader) => {
				const start = reader.skipBytes(this._byteLength);
				const bytes = reader.bytes;

				let end = start + this._byteLength;

				while (end > start && bytes[end - 1] === 0) end--;

				return decodeUtf8(bytes, start, end);
			};

			return;
		}

		let encoder: (value: string) => Uint8Array;
		let decoder: (data: Uint8Array) => string;

		switch (encoding) {
			case "hex": {
				encoder = decodeHex;
				decoder = encodeHex;

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

		this._encoder = (value, writer) => {
			const valueBuffer = encoder(value);

			this._bufferCodec._encode(valueBuffer, writer);
		};

		this._decoder = (reader) => decoder(this._bufferCodec._decode(reader));
	}

	byteLength(): number {
		return this._byteLength;
	}

	_encode(value: string, writer: Writer): void {
		this._encoder(value, writer);
	}

	_decode(reader: Reader): string {
		return this._decoder(reader);
	}
}

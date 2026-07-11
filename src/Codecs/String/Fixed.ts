import { base32, base58, base64, base64url } from "@scure/base";
import { StringEncoding } from ".";
import { decodeHex, encodeHex } from "../../utilities/hex";
import { Reader } from "../../utilities/Reader";
import { decodeUtf8, encodeUtf8Into, SHORT_STRING_THRESHOLD, utf8ByteLength } from "../../utilities/utf8";
import { Writer } from "../../utilities/Writer";
import { AbstractCodec } from "../Abstract";
import { BytesFixedCodec } from "../Bytes/Fixed";

const textEncoder = new TextEncoder();

export class StringFixedCodec extends AbstractCodec<string> {
	private _byteLength: number;
	private _bufferCodec: BytesFixedCodec;
	private _encoder: (value: string, writer: Writer) => void;
	private _decoder: (reader: Reader) => string;

	constructor(byteLength: number, public readonly encoding: StringEncoding = "utf8") {
		super();

		this._byteLength = byteLength;
		this._bufferCodec = new BytesFixedCodec(byteLength);

		if (encoding === "utf8") {
			this._encoder = (value, writer) => {
				// Only short strings take the manual path: their byteLength scan is cheap, and it wins by writing straight into the reserved region. For long strings the scan would not pay off, and an over-length value would waste it entirely, so use the incumbent encode.
				if (value.length <= SHORT_STRING_THRESHOLD) {
					const byteLength = utf8ByteLength(value);

					if (byteLength <= this._byteLength) {
						const offset = writer.reserve(byteLength);

						encodeUtf8Into(value, writer.bytes, offset);

						return;
					}
				}

				// Over-length truncates mid-character: the incumbent subarray cut writes exactly _byteLength bytes, whereas encodeInto stops at a character boundary and would change the wire format. A fitting long value writes its full encoding (subarray is a no-op).
				writer.writeBytes(textEncoder.encode(value).subarray(0, this._byteLength));
			};
			this._decoder = (reader) => {
				const start = reader.skipBytes(this._byteLength);

				return decodeUtf8(reader.bytes, start, start + this._byteLength);
			};

			return;
		}

		let encoder: (str: string) => Uint8Array;
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

	isValid(value: unknown): value is string {
		return typeof value === "string";
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

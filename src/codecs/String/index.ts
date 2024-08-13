import { Context } from "../../utilities/Context";
import { LengthOptions } from "../../utilities/Length";
import { PointableOptions } from "../../utilities/Pointable";
import { Stream } from "../../utilities/Stream";
import { AbstractCodec } from "../Abstract";
import { PointerCodec } from "../Pointer";
import { UIntCodec } from "../UInt";

const FIXED_STRING_ENCODINGS = ["binary", "hex", "base64", "base64url"] as const;

type FixedStringEncoding = (typeof FIXED_STRING_ENCODINGS)[number];

const VARIABLE_STRING_ENCODINGS = ["utf8", "utf-8", "utf16le", "utf-16le", "ucs2", "ucs-2"] as const;

type VariableStringEncoding = (typeof VARIABLE_STRING_ENCODINGS)[number];

type StringEncoding = FixedStringEncoding | VariableStringEncoding | BufferEncoding;

const VARIABLE_STRING_ENCODINGS_SET = new Set<StringEncoding>(VARIABLE_STRING_ENCODINGS);

const BYTE_LENGTH_DIVIDER = {
	binary: 8,
	hex: 2,
	base64: 1.325,
	base64url: 1.325,
};

export interface StringCodecOptions extends LengthOptions, PointableOptions {
	encoding?: StringEncoding;
}

export class StringCodec extends AbstractCodec<string> {
	private readonly _encoding: StringEncoding;
	private readonly _length?: number;
	private readonly _lengthPointer?: PointerCodec<number>;
	private readonly _lengthCodec: UIntCodec;
	private readonly _isVariableLengthEncoding: boolean;

	constructor(options?: StringCodecOptions) {
		super();

		this._id = options?.id;
		this._encoding = options?.encoding || "utf8";
		this._length = options?.length;
		this._lengthPointer = options?.lengthPointer;
		this._lengthCodec = options?.lengthCodec || new UIntCodec();
		this._isVariableLengthEncoding = VARIABLE_STRING_ENCODINGS_SET.has(this._encoding);
	}

	match(value: any, context: Context): value is string {
		const isMatch = typeof value === "string";

		if (isMatch) {
			if (this._length && value.length !== this._length) return false;

			this.setContext(value, context);
		}

		return isMatch;
	}

	encodingLength(value: string, context: Context): number {
		this.setContext(value, context);

		const length = Buffer.byteLength(value, this._encoding);

		if (this._length || this._lengthPointer) return length;

		return this._lengthCodec.encodingLength(value.length, context) + length;
	}

	write(value: string, stream: Stream, context: Context): void {
		this.setContext(value, context);

		if (!this._length && !this._lengthPointer) this._lengthCodec.write(value.length, stream, context);

		stream.position += stream.buffer.write(value, stream.position, this._encoding);
	}

	read(stream: Stream, context: Context): string {
		const length = this._length || this._lengthPointer?.getValue(context) || this._lengthCodec.read(stream, context);

		if (this._isVariableLengthEncoding) {
			const value = stream.buffer.toString(this._encoding, stream.position, Math.min(stream.position + length * 4, stream.buffer.byteLength)).slice(0, length);

			stream.position += Buffer.byteLength(value, this._encoding);

			this.setContext(value, context);

			return value;
		}

		const byteLength = length / BYTE_LENGTH_DIVIDER[this._encoding as FixedStringEncoding];

		const value = stream.buffer.toString(this._encoding, stream.position, (stream.position += byteLength));

		this.setContext(value, context);

		return value;
	}
}

export const createStringCodec = (...parameters: ConstructorParameters<typeof StringCodec>) => {
	return new StringCodec(...parameters);
};

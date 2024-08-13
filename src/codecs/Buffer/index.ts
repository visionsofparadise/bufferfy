import { PolyfilledBuffer } from "../../utilities/Buffer";
import { Context } from "../../utilities/Context";
import { LengthOptions } from "../../utilities/Length";
import { PointableOptions } from "../../utilities/Pointable";
import { Stream } from "../../utilities/Stream";
import { AbstractCodec } from "../Abstract";
import { PointerCodec } from "../Pointer";
import { UIntCodec } from "../UInt";

export interface BufferCodecOptions extends LengthOptions, PointableOptions {}

export class BufferCodec extends AbstractCodec<Buffer> {
	private readonly _length?: number;
	private readonly _lengthPointer?: PointerCodec<number>;
	private readonly _lengthCodec: UIntCodec;

	constructor(options?: BufferCodecOptions) {
		super();

		this._length = options?.length;
		this._lengthPointer = options?.lengthPointer;
		this._lengthCodec = options?.lengthCodec || new UIntCodec();
	}

	match(value: any, context: Context): value is Buffer {
		const isMatch = value instanceof Buffer || value instanceof PolyfilledBuffer;

		if (isMatch) {
			if (this._length && value.byteLength !== this._length) return false;

			this.setContext(value, context);
		}

		return isMatch;
	}

	encodingLength(value: Buffer, context: Context): number {
		this.setContext(value, context);

		return this._length || this._lengthPointer?.getValue(context) || this._lengthCodec.encodingLength(value.byteLength, context) + value.byteLength;
	}

	write(value: Buffer, stream: Stream, context: Context): void {
		this.setContext(value, context);

		if (!this._length && !this._lengthPointer) this._lengthCodec.write(value.byteLength, stream, context);

		stream.position += value.copy(stream.buffer, stream.position);
	}

	read(stream: Stream, context: Context): Buffer {
		const length = this._length || this._lengthPointer?.getValue(context) || this._lengthCodec.read(stream, context);

		const value = stream.buffer.subarray(stream.position, (stream.position += length));

		this.setContext(value, context);

		return value;
	}
}

export function createBufferCodec(...parameters: ConstructorParameters<typeof BufferCodec>) {
	return new BufferCodec(...parameters);
}

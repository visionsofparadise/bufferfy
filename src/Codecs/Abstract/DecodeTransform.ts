import { concat } from "uint8array-tools";
import { AbstractCodec } from ".";
import { BufferfyByteLengthError } from "../../utilities/Error";

export interface DecodeTransformStreamOptions {
	maxBufferSize?: number;
}

export class DecodeTransformStream<Value = unknown> extends TransformStream<Uint8Array, Value> {
	private _valueBytes = Uint8Array.from([]);

	constructor(codec: AbstractCodec<Value>, options?: DecodeTransformStreamOptions) {
		const maxBufferSize = options?.maxBufferSize ?? 10 * 1024 * 1024; // 10MB default

		super({
			transform: async (chunk, controller) => {
				this._valueBytes = concat([this._valueBytes, chunk]);

				if (this._valueBytes.byteLength > maxBufferSize) {
					controller.error(new Error(`Decode buffer exceeded maximum size of ${maxBufferSize} bytes`));
					return;
				}

				try {
					while (this._valueBytes.byteLength) {
						const value = codec.decode(this._valueBytes);

						controller.enqueue(value);

						const byteLength = codec.byteLength(value);

						this._valueBytes = this._valueBytes.subarray(byteLength, this._valueBytes.byteLength);
					}
				} catch (error) {
					if (error instanceof BufferfyByteLengthError) return;

					controller.error(error);
				}
			},
		});
	}
}

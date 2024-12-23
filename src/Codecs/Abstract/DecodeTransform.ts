import { TransformStream } from "stream/web";
import { concat } from "uint8array-tools";
import { AbstractCodec } from ".";
import { BufferfyByteLengthError } from "../../utilities/Error";

export class DecodeTransformStream<Value = unknown> extends TransformStream<Uint8Array, Value> {
	private _valueBytes = Uint8Array.from([]);

	constructor(codec: AbstractCodec<Value>) {
		super({
			transform: async (chunk, controller) => {
				this._valueBytes = concat([this._valueBytes, chunk]);

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

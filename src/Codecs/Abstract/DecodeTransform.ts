import { concat } from "uint8array-tools";
import { AbstractCodec } from ".";
import { BufferfyByteLengthError, BufferfyError } from "../../utilities/Error";

const WARN_BUFFER_SIZE = 10 * 1024 * 1024; // 10MB
let hasWarned = false;

export class DecodeTransformStream<Value = unknown> extends TransformStream<Uint8Array, Value> {
	private _valueBytes: Uint8Array = Uint8Array.from([]);

	constructor(codec: AbstractCodec<Value>) {
		super({
			transform: async (chunk, controller) => {
				this._valueBytes = concat([this._valueBytes, chunk]);

				// Warn if buffer is getting large (potential DOS or incorrect codec usage)
				if (!hasWarned && this._valueBytes.byteLength > WARN_BUFFER_SIZE) {
					console.warn(
						`DecodeTransformStream buffer exceeded ${WARN_BUFFER_SIZE} bytes (${this._valueBytes.byteLength} bytes accumulated). ` +
							`This may indicate a DOS attack or incorrect codec usage. Consider validating input size upstream.`,
					);
					hasWarned = true;
				}

				try {
					while (this._valueBytes.byteLength) {
						const value = codec.decode(this._valueBytes);

						controller.enqueue(value);

						const byteLength = codec.byteLength(value);

						if (byteLength === 0) {
							controller.error(new BufferfyError("Codec returned zero byteLength, cannot make progress"));
							return;
						}

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

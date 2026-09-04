import type { AbstractCodec } from ".";

export class EncodeTransformStream<Value = unknown> extends TransformStream<Value, Uint8Array> {
	constructor(codec: AbstractCodec<Value>) {
		super({
			transform(value, controller) {
				try {
					const chunk = codec.encode(value);

					controller.enqueue(chunk);
				} catch (error) {
					controller.error(error);
				}
			},
		});
	}
}

import { Transform, TransformCallback, TransformOptions } from "stream";
import { AbstractCodec } from ".";

export class EncodeTransform<Value = unknown> extends Transform {
	constructor(public readonly codec: AbstractCodec<Value>, options?: TransformOptions) {
		super({
			...options,
			writableObjectMode: true,
			readableObjectMode: false,
		});
	}

	_transform(object: Value, _encoding: BufferEncoding, callback: TransformCallback): void {
		try {
			const chunk = this.codec.encode(object);

			callback(null, chunk);
		} catch (error) {
			if (error instanceof Error) {
				callback(error);

				return;
			}

			callback(new Error("Error in encode transform"));

			return;
		}
	}
}

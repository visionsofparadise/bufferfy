import { Transform, TransformCallback, TransformOptions } from "stream";
import { setImmediate } from "timers/promises";
import { AbstractCodec } from ".";

export class EncodeTransform<Value = unknown> extends Transform {
	constructor(public readonly codec: AbstractCodec<Value>, options?: TransformOptions) {
		super({
			...options,
			writableObjectMode: true,
		});
	}

	_queue: Promise<void> | undefined = new Promise<void>((resolve) => resolve());

	_transform(object: Value, _encoding: BufferEncoding, callback: TransformCallback): void {
		this._queue = this._queue?.then(() => {
			return new Promise<void>(async (resolve, reject) => {
				try {
					await this.codec._encodeChunks(object, this);

					callback(null);

					resolve();
				} catch (error) {
					if (error instanceof Error) callback(error);

					reject(error);
				}
			});
		});
	}

	_destroy(error: Error | null, callback: (error?: Error | null) => void): void {
		delete this._queue;

		super._destroy(error, callback);
	}

	async pushAsync(chunk: Buffer, encoding?: BufferEncoding): Promise<void> {
		while (!this.push(chunk, encoding)) await setImmediate();
	}
}

import { Transform, TransformCallback, TransformOptions } from "stream";
import { setImmediate } from "timers/promises";
import { AbstractCodec } from ".";
import { BufferfyByteLengthError } from "../../utilities/Error";

export class DecodeTransform<Value = unknown> extends Transform {
	constructor(public readonly codec: AbstractCodec<Value>, options?: TransformOptions) {
		super({
			...options,
			writableObjectMode: false,
			readableObjectMode: true,
		});
	}

	protected _valueBuffer: Buffer = Buffer.from([]);

	_transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback): void {
		this._valueBuffer = Buffer.concat([this._valueBuffer, chunk]);

		(async () => {
			try {
				const value = this.codec.decode(this._valueBuffer);

				while (!this.push(value)) await setImmediate();

				const byteLength = this.codec.byteLength(value);

				if (byteLength >= this._valueBuffer.byteLength) {
					this._valueBuffer = Buffer.from([]);
				} else {
					this._valueBuffer = this._valueBuffer.subarray(byteLength);
				}

				callback(null);
			} catch (error) {
				if (error instanceof BufferfyByteLengthError) {
					callback(null);

					return;
				}

				if (error instanceof Error) {
					callback(error);

					return;
				}

				callback(new Error("Error in decode transform"));

				return;
			}
		})();
	}

	_destroy(error: Error | null, callback: (error?: Error | null) => void): void {
		this._valueBuffer = Buffer.from([]);

		super._destroy(error, callback);
	}
}

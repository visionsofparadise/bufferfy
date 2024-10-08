import { Transform, TransformCallback, TransformOptions } from "stream";
import { setImmediate } from "timers/promises";
import { AbstractCodec } from ".";
import { BufferfyError } from "../../utilities/Error";

export class DecodeTransform<Value = unknown> extends Transform {
	constructor(public readonly codec: AbstractCodec<Value>, options?: TransformOptions) {
		super({
			...options,
			readableObjectMode: true,
		});
	}

	protected _decodeJob: Promise<void> | null | undefined;
	protected _chunks: Array<Buffer> = [];
	protected _chunksByteLength = 0;

	_transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback): void {
		this._chunks.push(chunk);
		this._chunksByteLength += chunk.byteLength;

		if (!this._decodeJob) {
			this._decodeJob = new Promise(async (resolve, reject) => {
				try {
					const value = await this.codec._decodeChunks(this);

					callback(null, value);

					this._decodeJob = null;

					resolve();
				} catch (error) {
					if (error instanceof Error) callback(error);

					reject(error);
				}
			});
		}
	}

	_destroy(error: Error | null, callback: (error?: Error | null) => void): void {
		delete this._decodeJob;
		this._chunks = [];
		this._chunksByteLength = 0;

		super._destroy(error, callback);
	}

	async consume(byteLength: number, minimumByteLength: number = byteLength): Promise<Buffer> {
		if (byteLength > this._chunksByteLength) byteLength = Math.max(minimumByteLength, this._chunksByteLength);

		while (!this._chunks[0] || byteLength > this._chunksByteLength) await setImmediate();

		if (byteLength < this._chunks[0].byteLength) {
			const buffer = this._chunks[0].subarray(0, byteLength);

			this._chunks[0] = this._chunks[0].subarray(byteLength);
			this._chunksByteLength -= byteLength;

			return buffer;
		}

		if (byteLength === this._chunks[0].byteLength) {
			const buffer = this._chunks.shift()!;

			this._chunksByteLength -= buffer.byteLength;

			return buffer;
		}

		let buffer = Buffer.allocUnsafe(byteLength);
		let offset = 0;

		while (offset < byteLength) {
			const chunk = this._chunks[0];

			if (!chunk) break;

			if (offset + chunk.byteLength <= byteLength) {
				offset += chunk.copy(buffer, offset, 0, byteLength);

				this._chunks.shift();
				this._chunksByteLength -= chunk.byteLength;
			} else {
				const remainingByteLength = byteLength - offset;

				offset += chunk.copy(buffer, offset, 0, remainingByteLength);

				this._chunks[0] = chunk.subarray(remainingByteLength);
				this._chunksByteLength -= remainingByteLength;
			}
		}

		if (buffer.byteLength < byteLength) throw new BufferfyError("Could not consume chunks");

		return buffer;
	}
}

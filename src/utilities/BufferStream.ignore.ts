import { Readable, ReadableOptions, Writable } from "stream";
import { BufferfyError } from "./Error";

export class BufferWriteStream extends Writable {
	buffer: Buffer | undefined = Buffer.allocUnsafe(4096);
	offset = 0;

	_reallocate(byteLength: number) {
		if (!this.buffer) return;

		const buffer = Buffer.allocUnsafe(Math.max(this.buffer.byteLength * 2, this.offset + byteLength));

		this.buffer.copy(buffer, 0, 0, this.offset);

		this.buffer = buffer;
	}

	_write(chunk: Buffer, _: BufferEncoding, callback: (error?: Error | null) => void): void {
		if (!this.buffer) return;

		try {
			if (this.offset + chunk.byteLength > this.buffer.byteLength) this._reallocate(chunk.byteLength);

			this.offset += chunk.copy(this.buffer, this.offset);

			callback();
		} catch (error) {
			callback(new BufferfyError("Failed to write to buffer", { cause: error }));
		}
	}
}

export class BufferReadStream extends Readable {
	offset = 0;

	constructor(public buffer: Buffer | undefined, options?: ReadableOptions) {
		super(options);
	}

	_read(size: number): void {
		if (!this.buffer) return;

		try {
			this.push(this.buffer.subarray(this.offset, this.offset + size));
			this.offset += size;

			if (this.offset >= this.buffer.byteLength) this.push(null);
		} catch (error) {
			this.destroy(new BufferfyError("BufferReadStream reading error", { cause: error }));
		}
	}
}

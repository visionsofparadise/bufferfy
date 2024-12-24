export class BytesWritableStream extends WritableStream<Uint8Array> {
	bytes = new Uint8Array(new ArrayBuffer(4096));
	offset = 0;

	_reallocate(byteLength: number) {
		if (!this.bytes) return;

		const newBuffer = new Uint8Array(new ArrayBuffer(Math.max(this.bytes.byteLength * 2, this.offset + byteLength)));

		this.bytes.forEach((value, index) => (newBuffer[index] = value));

		this.bytes = newBuffer;
	}

	constructor() {
		super({
			write: (chunk) => {
				if (!this.bytes) return;

				if (this.offset + chunk.byteLength > this.bytes.byteLength) this._reallocate(chunk.byteLength);

				for (const value of chunk) this.bytes[this.offset++] = value;
			},
		});
	}
}

export class BytesReadableStream extends ReadableStream<Uint8Array> {
	bytes: Uint8Array;
	offset = 0;

	constructor(bytes: Uint8Array) {
		super({
			pull: (controller) => {
				if (this.offset >= bytes.byteLength) controller.close();

				try {
					controller.enqueue(this.bytes);
					this.offset += this.bytes.byteLength;
				} catch (error) {
					controller.error(error);
				}
			},
		});

		this.bytes = bytes;
	}
}

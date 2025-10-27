export class Writer {
	private buffer: Uint8Array;
	private view: DataView;
	private offset: number;

	constructor(buffer?: Uint8Array, initialSize = 1024) {
		this.buffer = buffer || new Uint8Array(initialSize);
		this.view = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
		this.offset = 0;
	}

	get position(): number {
		return this.offset;
	}

	private ensureCapacity(additionalBytes: number): void {
		const required = this.offset + additionalBytes;

		if (required <= this.buffer.byteLength) return;

		let newSize = this.buffer.byteLength * 2;

		while (newSize < required) newSize *= 2;

		const newBuffer = new Uint8Array(newSize);

		newBuffer.set(this.buffer);

		this.buffer = newBuffer;
		this.view = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
	}

	toBuffer(): Uint8Array {
		return this.buffer.subarray(0, this.offset);
	}

	writeByte(value: number): void {
		this.ensureCapacity(1);
		this.buffer[this.offset++] = value;
	}

	writeBytes(bytes: Uint8Array): void {
		this.ensureCapacity(bytes.byteLength);
		this.buffer.set(bytes, this.offset);
		this.offset += bytes.byteLength;
	}

	writeDataView(byteLength: number, fn: (view: DataView, offset: number) => void): void {
		this.ensureCapacity(byteLength);
		fn(this.view, this.offset);
		this.offset += byteLength;
	}
}

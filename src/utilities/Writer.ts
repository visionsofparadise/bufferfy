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

	// Growth swaps the underlying array; a caller holding this reference across a write that grows the buffer must re-read the getter.
	get bytes(): Uint8Array {
		return this.buffer;
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

	reserve(byteLength: number): number {
		this.ensureCapacity(byteLength);
		const offset = this.offset;
		this.offset += byteLength;
		return offset;
	}

	writeUint16(value: number, littleEndian: boolean): void {
		this.ensureCapacity(2);
		this.view.setUint16(this.offset, value, littleEndian);
		this.offset += 2;
	}

	writeUint24(value: number, littleEndian: boolean): void {
		this.ensureCapacity(3);
		const high = value >>> 8;
		const low = value & 0xff;
		if (littleEndian) {
			this.view.setUint8(this.offset, low);
			this.view.setUint16(this.offset + 1, high, true);
		} else {
			this.view.setUint16(this.offset, high, false);
			this.view.setUint8(this.offset + 2, low);
		}
		this.offset += 3;
	}

	writeUint32(value: number, littleEndian: boolean): void {
		this.ensureCapacity(4);
		this.view.setUint32(this.offset, value, littleEndian);
		this.offset += 4;
	}

	writeUint40(value: number, littleEndian: boolean): void {
		this.ensureCapacity(5);
		const high = Math.floor(value / 0x100000000);
		const low = value % 0x100000000;
		if (littleEndian) {
			this.view.setUint32(this.offset, low, true);
			this.view.setUint8(this.offset + 4, high);
		} else {
			this.view.setUint8(this.offset, high);
			this.view.setUint32(this.offset + 1, low, false);
		}
		this.offset += 5;
	}

	writeUint48(value: number, littleEndian: boolean): void {
		this.ensureCapacity(6);
		const high = Math.floor(value / 0x100000000);
		const low = value % 0x100000000;
		if (littleEndian) {
			this.view.setUint32(this.offset, low, true);
			this.view.setUint16(this.offset + 4, high, true);
		} else {
			this.view.setUint16(this.offset, high, false);
			this.view.setUint32(this.offset + 2, low, false);
		}
		this.offset += 6;
	}

	writeFloat32(value: number, littleEndian: boolean): void {
		this.ensureCapacity(4);
		this.view.setFloat32(this.offset, value, littleEndian);
		this.offset += 4;
	}

	writeFloat64(value: number, littleEndian: boolean): void {
		this.ensureCapacity(8);
		this.view.setFloat64(this.offset, value, littleEndian);
		this.offset += 8;
	}

	writeBigUint64(value: bigint, littleEndian: boolean): void {
		this.ensureCapacity(8);
		this.view.setBigUint64(this.offset, value, littleEndian);
		this.offset += 8;
	}
}

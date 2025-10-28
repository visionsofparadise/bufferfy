import { BufferfyByteLengthError } from "./Error.js";

export class Reader {
	private view: DataView;

	constructor(
		private buffer: Uint8Array,
		private offset = 0,
	) {
		this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
	}

	get position(): number {
		return this.offset;
	}

	get remaining(): number {
		return this.buffer.byteLength - this.offset;
	}

	private ensureBytes(count: number): void {
		if (this.remaining < count) {
			throw new BufferfyByteLengthError();
		}
	}

	readByte(): number {
		this.ensureBytes(1);
		return this.buffer[this.offset++];
	}

	readBytes(count: number): Uint8Array {
		this.ensureBytes(count);
		const bytes = this.buffer.subarray(this.offset, this.offset + count);
		this.offset += count;
		return bytes;
	}

	readDataView<T>(byteLength: number, fn: (view: DataView, offset: number) => T): T {
		this.ensureBytes(byteLength);
		const value = fn(this.view, this.offset);
		this.offset += byteLength;
		return value;
	}

	peekBytes(start: number, end: number): Uint8Array {
		return this.buffer.subarray(start, end);
	}
}

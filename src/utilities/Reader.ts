import { BufferfyByteLengthError } from "./Error";

export class Reader {
	private _view: DataView;

	constructor(
		private buffer: Uint8Array,
		private offset = 0,
	) {
		this._view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
	}

	get position(): number {
		return this.offset;
	}

	get remaining(): number {
		return this.buffer.byteLength - this.offset;
	}

	get bytes(): Uint8Array {
		return this.buffer;
	}

	get view(): DataView {
		return this._view;
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

	skipBytes(count: number): number {
		this.ensureBytes(count);

		const offset = this.offset;

		this.offset += count;

		return offset;
	}

	peekBytes(start: number, end: number): Uint8Array {
		return this.buffer.subarray(start, end);
	}
}

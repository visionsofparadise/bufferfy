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

	get bytes(): Uint8Array {
		return this.buffer;
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

	readUint16(littleEndian: boolean): number {
		this.ensureBytes(2);
		const value = this.view.getUint16(this.offset, littleEndian);
		this.offset += 2;
		return value;
	}

	readUint24(littleEndian: boolean): number {
		this.ensureBytes(3);
		let high: number;
		let low: number;
		if (littleEndian) {
			low = this.view.getUint8(this.offset);
			high = this.view.getUint16(this.offset + 1, true);
		} else {
			high = this.view.getUint16(this.offset, false);
			low = this.view.getUint8(this.offset + 2);
		}
		this.offset += 3;
		return (high << 8) | low;
	}

	readUint32(littleEndian: boolean): number {
		this.ensureBytes(4);
		const value = this.view.getUint32(this.offset, littleEndian);
		this.offset += 4;
		return value;
	}

	readUint40(littleEndian: boolean): number {
		this.ensureBytes(5);
		let high: number;
		let low: number;
		if (littleEndian) {
			low = this.view.getUint32(this.offset, true);
			high = this.view.getUint8(this.offset + 4);
		} else {
			high = this.view.getUint8(this.offset);
			low = this.view.getUint32(this.offset + 1, false);
		}
		this.offset += 5;
		return high * 0x100000000 + low;
	}

	readUint48(littleEndian: boolean): number {
		this.ensureBytes(6);
		let high: number;
		let low: number;
		if (littleEndian) {
			low = this.view.getUint32(this.offset, true);
			high = this.view.getUint16(this.offset + 4, true);
		} else {
			high = this.view.getUint16(this.offset, false);
			low = this.view.getUint32(this.offset + 2, false);
		}
		this.offset += 6;
		return high * 0x100000000 + low;
	}

	readFloat32(littleEndian: boolean): number {
		this.ensureBytes(4);
		const value = this.view.getFloat32(this.offset, littleEndian);
		this.offset += 4;
		return value;
	}

	readFloat64(littleEndian: boolean): number {
		this.ensureBytes(8);
		const value = this.view.getFloat64(this.offset, littleEndian);
		this.offset += 8;
		return value;
	}

	readBigUint64(littleEndian: boolean): bigint {
		this.ensureBytes(8);
		const value = this.view.getBigUint64(this.offset, littleEndian);
		this.offset += 8;
		return value;
	}

	peekBytes(start: number, end: number): Uint8Array {
		return this.buffer.subarray(start, end);
	}
}

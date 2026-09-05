import type { Reader } from "./Reader";
import type { Writer } from "./Writer";

export const writeUInt24 = (value: number, writer: Writer, littleEndian: boolean): void => {
	const offset = writer.reserve(3);
	const view = writer.currentView;

	const high = value >>> 8;
	const low = value & 0xff;

	if (littleEndian) {
		view.setUint8(offset, low);
		view.setUint16(offset + 1, high, true);
	} else {
		view.setUint16(offset, high, false);
		view.setUint8(offset + 2, low);
	}
};

export const readUInt24 = (reader: Reader, littleEndian: boolean): number => {
	const offset = reader.skipBytes(3);
	const view = reader.view;

	let high: number;
	let low: number;

	if (littleEndian) {
		low = view.getUint8(offset);
		high = view.getUint16(offset + 1, true);
	} else {
		high = view.getUint16(offset, false);
		low = view.getUint8(offset + 2);
	}

	return (high << 8) | low;
};

export const writeUInt40 = (value: number, writer: Writer, littleEndian: boolean): void => {
	const offset = writer.reserve(5);
	const view = writer.currentView;

	const high = Math.floor(value / 0x100000000);
	const low = value % 0x100000000;

	if (littleEndian) {
		view.setUint32(offset, low, true);
		view.setUint8(offset + 4, high);
	} else {
		view.setUint8(offset, high);
		view.setUint32(offset + 1, low, false);
	}
};

export const readUInt40 = (reader: Reader, littleEndian: boolean): number => {
	const offset = reader.skipBytes(5);
	const view = reader.view;

	let high: number;
	let low: number;

	if (littleEndian) {
		low = view.getUint32(offset, true);
		high = view.getUint8(offset + 4);
	} else {
		high = view.getUint8(offset);
		low = view.getUint32(offset + 1, false);
	}

	return high * 0x100000000 + low;
};

export const writeUInt48 = (value: number, writer: Writer, littleEndian: boolean): void => {
	const offset = writer.reserve(6);
	const view = writer.currentView;

	const high = Math.floor(value / 0x100000000);
	const low = value % 0x100000000;

	if (littleEndian) {
		view.setUint32(offset, low, true);
		view.setUint16(offset + 4, high, true);
	} else {
		view.setUint16(offset, high, false);
		view.setUint32(offset + 2, low, false);
	}
};

export const readUInt48 = (reader: Reader, littleEndian: boolean): number => {
	const offset = reader.skipBytes(6);
	const view = reader.view;

	let high: number;
	let low: number;

	if (littleEndian) {
		low = view.getUint32(offset, true);
		high = view.getUint16(offset + 4, true);
	} else {
		high = view.getUint16(offset, false);
		low = view.getUint32(offset + 2, false);
	}

	return high * 0x100000000 + low;
};

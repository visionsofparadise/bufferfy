import type { Reader } from "../../utilities/Reader";
import type { Writer } from "../../utilities/Writer";

/**
 * Strategy interface for byte order (endianness) handling.
 * Codecs determine byte VALUES in logical order (index 0 = high byte).
 * Strategies determine write ORDER (forward for BE, reverse for LE).
 */
export interface ByteOrderStrategy {
	write(writer: Writer, byteLength: number, getByteValue: (index: number) => number): void;
	read(reader: Reader, byteLength: number): number[];
}

/**
 * Big-endian byte order strategy.
 * Most significant byte first (network byte order).
 * Writes bytes in forward order: index 0, 1, 2, ...
 */
export class BigEndianStrategy implements ByteOrderStrategy {
	write(writer: Writer, byteLength: number, getByteValue: (index: number) => number): void {
		for (let i = 0; i < byteLength; i++) {
			writer.writeByte(getByteValue(i));
		}
	}

	read(reader: Reader, byteLength: number): number[] {
		const bytes: number[] = [];

		for (let i = 0; i < byteLength; i++) {
			bytes[i] = reader.readByte();
		}

		return bytes;
	}
}

/**
 * Little-endian byte order strategy.
 * Least significant byte first (x86 byte order).
 * Writes bytes in reverse order: index n-1, n-2, ..., 0
 */
export class LittleEndianStrategy implements ByteOrderStrategy {
	write(writer: Writer, byteLength: number, getByteValue: (index: number) => number): void {
		for (let i = byteLength - 1; i >= 0; i--) {
			writer.writeByte(getByteValue(i));
		}
	}

	read(reader: Reader, byteLength: number): number[] {
		const bytes: number[] = [];

		for (let i = byteLength - 1; i >= 0; i--) {
			bytes[i] = reader.readByte();
		}

		return bytes;
	}
}

// Singleton instances for reuse across all codecs
export const BE_STRATEGY = new BigEndianStrategy();
export const LE_STRATEGY = new LittleEndianStrategy();

import { type ValidationMode } from "../UInt";
import { VarInt15Codec } from "./VarInt15";
import { VarInt30Codec } from "./VarInt30";
import { VarInt60Codec } from "./VarInt60";

export const varIntBitValues = [15, 30, 60] as const;

export type VarIntBits = (typeof varIntBitValues)[number];

export interface VarIntCodecOptions {
	minimum?: number;
	maximum?: number;
	validationMode?: ValidationMode;
}

export type VarIntCodec = VarInt15Codec | VarInt30Codec | VarInt60Codec;

/**
 * Creates a codec for a variable length unsigned integer. The initial byte allocates bits to indicate how many more bytes to read for the integer.
 *
 * Serializes to ```[UINT & LENGTH][...UINT_REST?]```
 *
 * 15BIT:
 * 1 bit allocated to 0-1 more bytes to read
 * - 0 <= 127: 1 byte
 * - 128 <= 32767: 2 byte
 *
 * 30BIT:
 * 2 bits allocated to 0-3 more bytes to read
 * - 0 <= 63: 1 byte
 * - 64 <= 16383: 2 byte
 * - 16384 <= 4194303: 3 byte
 * - 4194304 <= 1073741823: 4 byte
 *
 * 60BIT:
 * 3 bits allocated to 0-7 more bytes to read
 * - 0 <= 31: 1 byte
 * - 32 <= 8191: 2 byte
 * - 8192 <= 2097151: 3 byte
 * - 2097152 <= 536870911: 4 byte
 * - 536870912 <= 137438953471: 5 byte
 * - 137438953472 <= 35184372088831: 6 byte
 * - 35184372088831 <= 281474976710656: 7 byte
 *
 * @param	{15 | 30 | 60} [bits=60] - Bit type of integer.
 * @param	{VarIntCodecOptions} [options] - Validation options (minimum, maximum)
 * @return	{VarIntCodec} VarUIntCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/VarInt/index.ts|Source}
 */
export const createVarIntCodec = (bits: VarIntBits = 60, options?: VarIntCodecOptions) => {
	switch (bits) {
		case 15: {
			return new VarInt15Codec(options);
		}
		case 30: {
			return new VarInt30Codec(options);
		}
		case 60: {
			return new VarInt60Codec(options);
		}
	}
};

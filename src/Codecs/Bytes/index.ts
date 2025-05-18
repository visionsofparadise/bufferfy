import { AbstractCodec } from "../Abstract";
import { VarInt60Codec } from "../VarInt/VarInt60";
import { BytesConstantCodec } from "./Constant";
import { BytesFixedCodec } from "./Fixed";
import { BytesVariableCodec } from "./Variable";

export type BytesCodec = BytesFixedCodec | BytesVariableCodec;

/**
 * Creates a codec for a variable length buffer.
 *
 * Serializes to ```[LENGTH?][BUFFER]```
 *
 * @param	{AbstractCodec<number>} [lengthCodec="VarInt50()"] - Codec to specify how the length is encoded.
 * @return	{BytesCodec} BytesCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Bytes/index.ts|Source}
 */
export function createBytesCodec(lengthCodec?: AbstractCodec<number>): BytesVariableCodec;

/**
 * Creates a codec for a fixed length buffer.
 *
 * Serializes to ```[BUFFER]```
 *
 * @param	{number} length - Sets a fixed length.
 * @return	{BytesCodec} BytesCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Bytes/index.ts|Source}
 */
export function createBytesCodec(length: number): BytesFixedCodec;

/**
 * Creates a codec for a constant buffer.
 *
 * Serializes to ```[BUFFER]```
 *
 * @param	{Uint8Array} bytes - Constant bytes value.
 * @return	{BytesCodec} BytesCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Bytes/index.ts|Source}
 */
export function createBytesCodec(bytes: Uint8Array): BytesConstantCodec;

export function createBytesCodec(constantOrLengthOrCodec: Uint8Array | number | AbstractCodec<number> = new VarInt60Codec()): BytesCodec {
	if (constantOrLengthOrCodec instanceof Uint8Array) return new BytesConstantCodec(constantOrLengthOrCodec);
	if (typeof constantOrLengthOrCodec === "number") return new BytesFixedCodec(constantOrLengthOrCodec);

	return new BytesVariableCodec(constantOrLengthOrCodec);
}

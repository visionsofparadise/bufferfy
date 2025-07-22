import { AbstractCodec } from "../Abstract";
import { VarInt60Codec } from "../VarInt/VarInt60";
import { NumberFixedCodec } from "./Fixed";
import { NumberVariableCodec } from "./Variable";

export type NumberCodec = NumberFixedCodec | NumberVariableCodec;

/**
 * Creates a codec for a variable length buffer.
 *
 * Serializes to ```[LENGTH?][BUFFER]```
 *
 * @param	{AbstractCodec<number>} [lengthCodec="VarInt50()"] - Codec to specify how the length is encoded.
 * @return	{NumberCodec} NumberCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Number/index.ts|Source}
 */
export function createNumberCodec(lengthCodec?: AbstractCodec<number>): NumberVariableCodec;

/**
 * Creates a codec for a fixed length buffer.
 *
 * Serializes to ```[BUFFER]```
 *
 * @param	{number} length - Sets a fixed length.
 * @return	{NumberCodec} NumberCodec
 *
 * {@link https://github.com/visionsofparadise/bufferfy/blob/main/src/Codecs/Number/index.ts|Source}
 */
export function createNumberCodec(length: number): NumberFixedCodec;

export function createNumberCodec(constantOrLengthOrCodec: number | AbstractCodec<number> = new VarInt60Codec()): NumberCodec {
	if (typeof constantOrLengthOrCodec === "number") return new NumberFixedCodec(constantOrLengthOrCodec);

	return new NumberVariableCodec(constantOrLengthOrCodec);
}
